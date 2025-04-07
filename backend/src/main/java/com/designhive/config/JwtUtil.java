package com.designhive.config;


import java.security.Key;
import java.util.Date;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    private final Key key = Keys.hmacShaKeyFor(
            "MySuperSecureJWTSigningKeyThatIsDefinitelyAtLeast32Bytes!".getBytes()
    );

    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 24; // 24 hours

    // ✅ Generate token
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ Extract email from token
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    // ✅ Parse token claims
    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ✅ Create Authentication object for Spring Security
    public Authentication buildAuthentication(String token) {
        String email = extractUsername(token);
        return new UsernamePasswordAuthenticationToken(email, null, null);
    }

    public Key getKey() {
        return this.key;
    }
}
