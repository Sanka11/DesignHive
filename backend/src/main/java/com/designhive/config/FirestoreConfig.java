package com.designhive.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirestoreConfig {

    private static final Logger logger = LoggerFactory.getLogger(FirestoreConfig.class);
    private static final String FIREBASE_CONFIG_FILE = "firebase-adminsdk.json";

    @PostConstruct
    public void initializeFirebase() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream serviceAccount = new ClassPathResource(FIREBASE_CONFIG_FILE).getInputStream();

                FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setDatabaseUrl("https://designhive-9cd14.firebaseio.com") // Add this line
                    .setStorageBucket("designhive-9cd14.appspot.com")
                    .build();

                FirebaseApp.initializeApp(options);
                logger.info("Firebase application has been initialized");
            }
        } catch (IOException e) {
            logger.error("Failed to initialize Firebase application", e);
        }
    }

    @Bean
    public Firestore getFirestore() {
        try {
            return FirestoreClient.getFirestore();
        } catch (Exception e) {
            logger.error("Failed to get Firestore instance", e);
            throw new RuntimeException("Failed to initialize Firestore", e);
        }
    }
}
