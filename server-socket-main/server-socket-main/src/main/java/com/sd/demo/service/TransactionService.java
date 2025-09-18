package com.sd.demo.service;

import java.util.List;
import java.util.concurrent.ExecutionException;

import org.springframework.stereotype.Service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteResult;
import com.sd.demo.config.FirebaseConfig;
import com.sd.demo.model.Transaction;
import com.sd.demo.shared.Utils;

@Service
public class TransactionService {

    private final FirebaseConfig firebaseConfig;
    private final Firestore db;

    public TransactionService(FirebaseConfig firebaseConfig) {
        this.firebaseConfig = firebaseConfig;
        this.db = firebaseConfig.getFirestore();
    }

    public void createTransaction(Transaction transaction)
            throws InterruptedException, ExecutionException {
        transaction.setId(Utils.generateRandomId());
        DocumentReference docRef = db.collection("transactions").document(transaction.getId());
        ApiFuture<WriteResult> result = docRef.set(transaction);
        System.out.println("Transaction added with ID: " + transaction.getId() + " at " + result.get().getUpdateTime());
    }

    public Transaction getTransaction(String id) throws InterruptedException, ExecutionException {
        DocumentReference docRef = db.collection("transactions").document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();

        if (!document.exists()) {
            return null;
        }
        return document.toObject(Transaction.class);
    }

    public List<Transaction> getAllTransactions() throws InterruptedException, ExecutionException {
        ApiFuture<QuerySnapshot> future = db.collection("transactions").get();
        QuerySnapshot querySnapshot = future.get();
        return querySnapshot.toObjects(Transaction.class);
    }

    public boolean deleteTransaction(String id) throws InterruptedException, ExecutionException {
        DocumentReference docRef = db.collection("transactions").document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();

        if (!document.exists()) {
            System.out.println("Transaction with ID " + id + " does not exist.");
            return false;
        }
        ApiFuture<WriteResult> result = docRef.delete();
        result.get();
        System.out.println("Transaction with ID " + id + " deleted.");
        return true;
    }
}
