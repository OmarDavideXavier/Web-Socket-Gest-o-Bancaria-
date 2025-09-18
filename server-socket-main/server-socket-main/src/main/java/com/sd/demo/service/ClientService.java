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
import com.sd.demo.model.Client;
import com.sd.demo.shared.Utils;

@Service
public class ClientService {
    private final FirebaseConfig firebaseConfig;
    private Firestore db;

    public ClientService(FirebaseConfig firebaseConfig) {
        this.firebaseConfig = firebaseConfig;
        this.db = firebaseConfig.getFirestore();
    }

    public Client addClient(Client client) throws InterruptedException, ExecutionException {
        client.setId(Utils.generateRandomId());
        DocumentReference docRef = db.collection("clients").document(client.getId());
        ApiFuture<WriteResult> result = docRef.set(client);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();

        System.out.println("Client added with ID: " + client.getId() + " at " + result.get().getUpdateTime());
        return document.toObject(Client.class);
    }

    public Client getClientById(String id) throws InterruptedException, ExecutionException {
        DocumentReference docRef = db.collection("clients").document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();

        if (!document.exists()) {
            return null;
        }
        return document.toObject(Client.class);
    }

    public boolean deleteClientById(String id) throws InterruptedException, ExecutionException {
        DocumentReference docRef = db.collection("clients").document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();

        if (!document.exists()) {
            System.out.println("Client with ID " + id + " does not exist.");
            return false;
        }
        ApiFuture<WriteResult> result = docRef.delete();
        result.get();
        System.out.println("Client with ID " + id + " deleted.");
        return true;
    }

    public List<Client> getAllClients() throws InterruptedException, ExecutionException {
        ApiFuture<QuerySnapshot> future = db.collection("clients").get();
        QuerySnapshot querySnapshot = future.get();
        return querySnapshot.toObjects(Client.class);
    }

    public Client updateClient(Client client) throws InterruptedException, ExecutionException {
        DocumentReference docRef = db.collection("clients").document(client.getId());
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();

        if (!document.exists()) {
            System.out.println("Client with ID " + client.getId() + " does not exist.");
            return null;
        }
        ApiFuture<WriteResult> result = docRef.set(client);
        System.out.println("Client updated with ID: " + client.getId() + " at " + result.get().getUpdateTime());
        return document.toObject(Client.class);
    }

    // public BankAccount addAccount() {
    //     BankAccount account = new BankAccount();

    //     ApiFuture<WriteResult> result = db.collection("bank-accounts").document(account.getId()).set(account);
    //     return account;
    // }

    // public Client createClient(Client client) {
    //     return repository.save(client);
    // }

    // public Client getClientById(String id) {
    //     return repository.findById(id).orElse(null);
    // }

    // public List<Client> getAllClients() {
    //     return repository.findAll();
    // }

    // public Client updateClient(String id, Client client) {
    //     if (!repository.existsById(id)) {
    //         return null;
    //     }
    //     client.setId(id);
    //     return repository.save(client);
    // }

    // public boolean deleteClient(String id) {
    //     if (!repository.existsById(id)) {
    //         return false;
    //     }
    //     repository.deleteById(id);
    //     return true;
    // }
}
