package com.insecurebank.game.service;

import com.insecurebank.game.model.BankCustomer;
import com.insecurebank.game.util.HashUtil;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Validates shared bank credentials by hitting the bank's REAL customers
 * table (auth_db schema) directly -- no copy of credentials lives here.
 * See auth-service's Customer entity / init-db.sql for the source of truth
 * on column names (id, phone_number, full_name, password, is_verified).
 */
@Service
public class BankAuthService {

    private static final RowMapper<BankCustomer> ROW_MAPPER = (rs, rowNum) -> new BankCustomer(
            rs.getString("id"),
            rs.getString("phone_number"),
            rs.getString("full_name"),
            rs.getString("password"),
            rs.getBoolean("is_verified")
    );

    private final JdbcTemplate bankJdbcTemplate;

    public BankAuthService(JdbcTemplate bankJdbcTemplate) {
        this.bankJdbcTemplate = bankJdbcTemplate;
    }

    public Optional<BankCustomer> findByUsername(String username) {
        try {
            BankCustomer customer = bankJdbcTemplate.queryForObject(
                    "SELECT id, phone_number, full_name, password, is_verified FROM customers WHERE phone_number = ?",
                    ROW_MAPPER,
                    normalizePhone(username)
            );
            return Optional.ofNullable(customer);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    /**
     * Normalize Indonesian phone numbers to the canonical +62 format stored in
     * the bank DB (mirrors the bank frontend's normalizePhoneNumber). Accepts
     * +628xxxxx, 08xxxxx (leading 0 dropped), and 628xxxxx (leading 62), plus
     * spaces/dashes/parens. Returns null if not a plausible Indonesian number.
     */
    public String normalizePhone(String phone) {
        if (phone == null) return null;
        String cleaned = phone.replaceAll("[\\s\\-()\\.]", "");
        String number;
        if (cleaned.startsWith("+62")) {
            number = cleaned.substring(3);
        } else if (cleaned.startsWith("08")) {
            number = cleaned.substring(1); // '0' removed, keeps leading '8'
        } else if (cleaned.startsWith("62")) {
            number = cleaned.substring(2);
        } else {
            return null;
        }
        if (!number.startsWith("8") || number.length() < 9 || number.length() > 12 || !number.matches("\\d+")) {
            return null;
        }
        return "+62" + number;
    }

    public Optional<BankCustomer> findById(String customerId) {
        try {
            BankCustomer customer = bankJdbcTemplate.queryForObject(
                    "SELECT id, phone_number, full_name, password, is_verified FROM customers WHERE id = ?",
                    ROW_MAPPER,
                    customerId
            );
            return Optional.ofNullable(customer);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    /** Same SHA1-without-salt scheme the bank's own auth-service uses. */
    public boolean checkPassword(BankCustomer customer, String rawPassword) {
        if (customer.getPasswordHash() == null) {
            return false;
        }
        return customer.getPasswordHash().equals(HashUtil.sha1Hash(rawPassword));
    }
}
