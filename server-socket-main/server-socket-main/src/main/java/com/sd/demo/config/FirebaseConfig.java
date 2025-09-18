package com.sd.demo.config;

import java.io.FileInputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;

import jakarta.annotation.PostConstruct;

@Configuration
public class FirebaseConfig {
    @Value("${firebase.service-account-path}")
    private String serviceAccountPath;
    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                FileInputStream serviceAccount = new FileInputStream("D:/Apresentacao SD/bank-db-4e66b-firebase-adminsdk-fbsvc-c0360f366b.json");
                System.out.println(serviceAccount);
                FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .setProjectId("bank-db-4e66b")
                .setDatabaseUrl("https://bank-db-4e66b.firebaseio.com")
                .build();

                FirebaseApp.initializeApp(options);
                logger.info("Firebase has been initialized.");
            }
        } catch( Exception e) {
            logger.error("Error initializing Firebase", e);
            throw new RuntimeException("Firebase initialization failed", e);
        }
        
    }

    public Firestore getFirestore() {
        try {
            return FirestoreClient.getFirestore();

        } catch (Exception e) {
            logger.error("Error getting Firestore instance", e);
            throw new RuntimeException("Failed to get Firestore instance", e);
        }
    }

}
