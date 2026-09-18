package com.insecurebank.game.service;

import com.insecurebank.game.dto.MyAccount;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Read-only lookup of a customer's own bank accounts, via the bank's real
 * transaction_db.accounts table (bankJdbcTemplate's default schema is
 * auth_db, so the query is schema-qualified). Used only to populate the
 * redeem page's destination-account dropdown -- it does not restrict what
 * account number the redeem endpoint itself will accept.
 */
@Service
public class BankAccountLookupService {

    private static final RowMapper<MyAccount> ROW_MAPPER = (rs, rowNum) -> new MyAccount(
            rs.getString("account_number"),
            rs.getString("account_type"),
            rs.getBigDecimal("balance")
    );

    private final JdbcTemplate bankJdbcTemplate;

    public BankAccountLookupService(JdbcTemplate bankJdbcTemplate) {
        this.bankJdbcTemplate = bankJdbcTemplate;
    }

    public List<MyAccount> findAccountsByCustomerId(String customerId) {
        return bankJdbcTemplate.query(
                "SELECT account_number, account_type, balance FROM transaction_db.accounts WHERE customer_id = ? ORDER BY account_number",
                ROW_MAPPER,
                customerId
        );
    }
}
