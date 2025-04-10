package com.designhive.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
public class FirebaseStorageService {

    private static final String BUCKET_NAME = "designhive-9cd14"; // Correct bucket name format
    private static final String FOLDER_PATH = "profile-images/";

    public String uploadFile(MultipartFile file) throws IOException {
        // Generate unique filename
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String storagePath = FOLDER_PATH + fileName;

        // Initialize Storage client
        Storage storage = StorageOptions.newBuilder()
                .setCredentials(GoogleCredentials.fromStream(
                        getClass().getClassLoader().getResourceAsStream("firebase-adminsdk.json")))
                .build()
                .getService();

        // Prepare file metadata
        BlobId blobId = BlobId.of(BUCKET_NAME, storagePath);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        // Upload file to Firebase Storage
        Blob blob = storage.create(blobInfo, file.getBytes());

        // Make the file publicly readable
        blob.toBuilder()
            .setAcl(new java.util.ArrayList<>(java.util.Arrays.asList(Acl.of(Acl.User.ofAllUsers(), Acl.Role.READER))))
            .build()
            .update();

        // Return the public URL (two options - choose one)

        // Option 1: Standard Google Storage URL
        String downloadUrl = String.format("https://storage.googleapis.com/%s/%s", 
                BUCKET_NAME, 
                URLEncoder.encode(storagePath, StandardCharsets.UTF_8.toString()));

        // Option 2: Firebase Storage URL (use this if you prefer Firebase's URL format)
        // String downloadUrl = String.format("https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
        //         BUCKET_NAME,
        //         URLEncoder.encode(storagePath, StandardCharsets.UTF_8.toString()));

        return downloadUrl;
    }
}