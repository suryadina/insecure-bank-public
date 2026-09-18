package com.insecurebank.game.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * SHA1 without salt -- matches the bank's own (intentionally weak) password
 * hashing scheme in auth-service, since we're validating against the same
 * customers.password column.
 */
public final class HashUtil {

    private HashUtil() {
    }

    public static String sha1Hash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] hashBytes = digest.digest(input.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}
