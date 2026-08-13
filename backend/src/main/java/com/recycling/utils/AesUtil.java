package com.recycling.utils;

import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;

@Component
public class AesUtil {
    
    private final SecretKeySpec secretKey;
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;  
    private static final int GCM_TAG_LENGTH = 128; 
    
    private final SecureRandom secureRandom = new SecureRandom();

    public AesUtil(@Value("${spring.ase.secret-key}") String secretKey){

        if(secretKey == null || secretKey.isEmpty()){
            throw new IllegalArgumentException("Encryption key config '${spring.ase.secret-key}' is missing.");
        }

        byte[] decodedKey = Base64.getDecoder().decode(secretKey);

        if(decodedKey.length != 32){
            throw new IllegalArgumentException("AES-256 key must be exactly 32 bytes after Base64 decoding. Current: " + decodedKey.length);
        }
        this.secretKey = new SecretKeySpec(decodedKey, "AES");
    }

    public String encrypt(String platinText){

        if(platinText == null) return null;

        try{
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, this.secretKey, gcmSpec);

            byte[] encryptedBytes = cipher.doFinal(platinText.getBytes(StandardCharsets.UTF_8));

            // [IV 16바이트] + [암호화된 데이터]를 하나로 합침
            byte[] combined = new byte[iv.length + encryptedBytes.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(encryptedBytes, 0, combined, iv.length, encryptedBytes.length);

            // 최종 합친 바이트 배열을 Base64로 인코딩해서 DB에 저장
            return Base64.getEncoder().encodeToString(combined);
        }catch(Exception e){
            throw new IllegalStateException("Encryption failed", e);
        }

    }

    public String decrypt(String cipherText){

        if(cipherText == null) return null;

        try{
            byte[] combined = Base64.getDecoder().decode(cipherText);
            
            byte[] iv = new byte[GCM_IV_LENGTH];
            byte[] encryptedBytes = new byte[combined.length - GCM_IV_LENGTH];
            
            // 복호화 시에도 기존 arraycopy 구조 그대로 사용
            System.arraycopy(combined, 0, iv, 0, GCM_IV_LENGTH);
            System.arraycopy(combined, GCM_IV_LENGTH, encryptedBytes, 0, encryptedBytes.length);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, this.secretKey, gcmSpec);
            
            byte[] decryptedBytes = cipher.doFinal(encryptedBytes);
            return new String(decryptedBytes, StandardCharsets.UTF_8);
        }catch(Exception e){
            throw new IllegalStateException("Encryption failed", e);
        }
    }
}
