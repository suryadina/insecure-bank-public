package com.insecurebank.auth.util

import java.security.MessageDigest

object HashUtil {
    
    /**
     * Hash a string using SHA1 without salt (intentionally vulnerable)
     * This is insecure and should never be used in production!
     */
    fun sha1Hash(input: String): String {
        val digest = MessageDigest.getInstance("SHA-1")
        val hashBytes = digest.digest(input.toByteArray())
        return hashBytes.joinToString("") { "%02x".format(it) }
    }
    
    /**
     * Verify if plain text matches SHA1 hash
     */
    fun verifySha1Hash(plainText: String, hash: String): Boolean {
        return sha1Hash(plainText) == hash
    }
}