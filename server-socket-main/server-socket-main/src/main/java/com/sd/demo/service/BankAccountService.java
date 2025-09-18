package com.sd.demo.service;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteResult;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.sd.demo.config.FirebaseConfig;
import com.sd.demo.model.BankAccount;
import com.sd.demo.model.Client;
import com.sd.demo.model.Transaction;
import com.sd.demo.shared.Utils;

@Service
public class BankAccountService {
    private final FirebaseConfig firebaseConfig;
    private final Firestore db;
    private final ClientService clientService;
    private final TransactionService transactionService;
    private final SimpMessagingTemplate messagingTemplate;

    public BankAccountService(FirebaseConfig firebaseConfig, ClientService clientService,
            TransactionService transactionService, SimpMessagingTemplate messagingTemplate) {
        this.firebaseConfig = firebaseConfig;
        this.db = firebaseConfig.getFirestore();
        this.clientService = clientService;
        this.messagingTemplate = messagingTemplate;
        this.transactionService = transactionService;
    }

    public BankAccount addBankAccount(String clientId, BankAccount bankAccount)
            throws InterruptedException, ExecutionException {
        DocumentReference docRef = db.collection("bankAccount").document(bankAccount.getAccountNumber());
        Client client = clientService.getClientById(clientId);
        if (client == null) {
            System.out.println("Client with ID " + clientId + " does not exist.");
            return null;
        }
        bankAccount.setClient(client);
        bankAccount.setCreatedAt(new Date());
        ApiFuture<WriteResult> result = docRef.set(bankAccount);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();
        System.out.println(
                "Account added with number: " + bankAccount.getAccountNumber() + " at " + result.get().getUpdateTime());
        return document.toObject(BankAccount.class);
    }

    public BankAccount getBankAccount(String id) throws InterruptedException, ExecutionException {
        DocumentReference docRef = db.collection("bankAccount").document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();

        if (!document.exists()) {
            return null;
        }
        return document.toObject(BankAccount.class);
    }

    public List<BankAccount> getAllAccounts() throws InterruptedException, ExecutionException {
        ApiFuture<QuerySnapshot> future = db.collection("bankAccount").get();
        QuerySnapshot querySnapshot = future.get();
        return querySnapshot.toObjects(BankAccount.class);
    }

    // public List<BankAccount> getAllAccounts() throws InterruptedException, ExecutionException {
    //     ApiFuture<QuerySnapshot> future = db.collection("bankAccount").get();
    //     QuerySnapshot querySnapshot = future.get();
    //     return querySnapshot.toObjects(BankAccount.class);
    // }

    public boolean deleteBankAccount(String id) throws InterruptedException, ExecutionException {
        DocumentReference docRef = db.collection("bankAccount").document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();

        if (!document.exists()) {
            System.out.println("Account with ID " + id + " does not exist.");
            return false;
        }
        ApiFuture<WriteResult> result = docRef.delete();
        result.get();
        System.out.println("Account with ID " + id + " deleted.");
        return true;
    }

    public BankAccount updateBankAccount(BankAccount account) throws InterruptedException, ExecutionException {
        DocumentReference docRef = db.collection("bankAccount").document(account.getAccountNumber());
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();
        if (!document.exists()) {
            System.out.println("Account with ID " + account.getAccountNumber() + " does not exist.");
            return null;
        }
        ApiFuture<WriteResult> result = docRef.set(account);
        result.get();
        System.out.println(
                "Account updated with ID: " + account.getAccountNumber() + " at " + result.get().getUpdateTime());
        return document.toObject(BankAccount.class);
    }

    public String checkBalance(String accountNumber) throws InterruptedException, ExecutionException {
        DocumentReference docRef = db.collection("bankAccount").document(accountNumber);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();

        if (!document.exists()) {
            return "Account with ID " + accountNumber + " does not exists.";
        }
        Transaction transaction = createTransaction(accountNumber, null, 0, "checkBalance");
        transactionService.createTransaction(transaction);
        return "Your balance is " + document.toObject(BankAccount.class).getBalance();
    }

    private Transaction createTransaction(String accountNumber, String accountNumberTo, double amount, String type)
            throws InterruptedException, ExecutionException {
        Transaction transaction = new Transaction();
        transaction.setId(Utils.generateRandomId());
        transaction.setAmount(amount);
        transaction.setDate(new Date());
        transaction.setType(type);
        transaction.setBankAccount(getBankAccount(accountNumber));
        transaction.setAccountNumberTo(accountNumberTo);
        return transaction;
    }

    public void transferFunds(String accountNumberFrom, String accountNumberTo, double amount)
            throws InterruptedException, ExecutionException {
        DocumentReference docRefFrom = db.collection("bankAccount").document(accountNumberFrom);
        DocumentReference docRefTo = db.collection("bankAccount").document(accountNumberTo);
        ApiFuture<DocumentSnapshot> futureFrom = docRefFrom.get();
        ApiFuture<DocumentSnapshot> futureTo = docRefTo.get();
        DocumentSnapshot documentFrom = futureFrom.get();
        DocumentSnapshot documentTo = futureTo.get();
        if (!documentFrom.exists() || !documentTo.exists()) {
            System.out.println("Account(s) do(es) not exist(s)!");
        }

        BankAccount accountFrom = documentFrom.toObject(BankAccount.class);
        BankAccount accountTo = documentTo.toObject(BankAccount.class);
        if (accountFrom.getBalance() < amount) {
            throw new IllegalArgumentException("Insufficient funds");
        }
        accountFrom.setBalance(accountFrom.getBalance() - amount);
        accountTo.setBalance(accountTo.getBalance() + amount);
        Transaction transaction = createTransaction(accountNumberFrom, accountNumberTo, amount, "transfer");
        transactionService.createTransaction(transaction);
        updateBankAccount(accountTo);
        updateBankAccount(accountFrom);
        String messageFrom = "Transferiu " + amount + "MZN para a conta " + accountNumberTo
                + "\nNovo saldo é " + accountFrom.getBalance() + "MZN";
        String messageTo = "Recebeu " + amount + "MZN da conta " + accountNumberFrom + "\nNovo saldo é "
                + accountTo.getBalance() + "MZN";
        messagingTemplate.convertAndSend("/topic/transaction/" + accountNumberFrom, messageFrom);
        messagingTemplate.convertAndSend("/topic/transaction/" + accountNumberTo, messageTo);
    }
    // public String transferFunds(String accountNumberFrom, String accountNumberTo,
    // double amount) throws InterruptedException, ExecutionException {
    // DocumentReference docRefFrom =
    // db.collection("bankAccount").document(accountNumberFrom);
    // DocumentReference docRefTo =
    // db.collection("bankAccount").document(accountNumberTo);
    // ApiFuture<DocumentSnapshot> futureFrom = docRefFrom.get();
    // ApiFuture<DocumentSnapshot> futureTo = docRefTo.get();
    // DocumentSnapshot documentFrom = futureFrom.get();
    // DocumentSnapshot documentTo = futureTo.get();
    // if (!documentFrom.exists() || !documentTo.exists()) {
    // System.out.println("Account(s) do(es) not exist(s)!");
    // }

    // BankAccount accountFrom = documentFrom.toObject(BankAccount.class);
    // BankAccount accountTo = documentTo.toObject(BankAccount.class);
    // if (accountFrom.getBalance() < amount) {
    // throw new IllegalArgumentException("Insufficient funds");
    // }
    // accountFrom.setBalance(accountFrom.getBalance() - amount);
    // accountTo.setBalance(accountTo.getBalance() + amount);
    // Transaction transaction = createTransaction(accountNumberFrom,
    // accountNumberTo, amount, "transfer");
    // transactionService.createTransaction(transaction);
    // updateBankAccount(accountTo);
    // updateBankAccount(accountFrom);
    // return "You successfully transferred " + amount + " from account " +
    // accountNumberFrom + " to account " + accountNumberTo + "\nYour new balance is
    // " + accountFrom.getBalance();
    // }

    public void depositFunds(String accountNumber, double amount) throws InterruptedException, ExecutionException {
        DocumentReference docRef = db.collection("bankAccount").document(accountNumber);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();

        if (!document.exists()) {
            System.out.println("Account with ID " + accountNumber + " does not exists.");
        }

        BankAccount account = document.toObject(BankAccount.class);

        account.setBalance(account.getBalance() + amount);
        Transaction transaction = createTransaction(accountNumber, null, amount, "deposit");
        transactionService.createTransaction(transaction);
        updateBankAccount(account);
        String message = "Depositou " + amount + "MZN na conta " + accountNumber
                + "\nNovo saldo é " + account.getBalance() + "MZN";
        messagingTemplate.convertAndSend("/topic/transaction/" + accountNumber, message);
    }

    // if (!document.exists()) {
    // System.out.println("Account with ID " + accountNumber + " does not exists.");
    // }

    // BankAccount account = document.toObject(BankAccount.class);

    // account.setBalance(account.getBalance() + amount);
    // Transaction transaction = createTransaction(accountNumber, null, amount,
    // "deposit");
    // transactionService.createTransaction(transaction);
    // updateBankAccount(account);
    // return "You successfully deposited " + amount + " into account " +
    // accountNumber + "\nYour new balance is " + account.getBalance();
    // }

    public void withdraw(String accountNumber, double amount) throws InterruptedException, ExecutionException {
        DocumentReference docRef = db.collection("bankAccount").document(accountNumber);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();

        if (!document.exists()) {
            System.out.println("Account with ID " + accountNumber + " does not exists.");
        }

        BankAccount account = document.toObject(BankAccount.class);

        account.setBalance(account.getBalance() - amount);
        Transaction transaction = createTransaction(accountNumber, null, amount, "withdraw");
        transactionService.createTransaction(transaction);
        updateBankAccount(account);
        String message = "Levantou " + amount + "MZN"
                + "\nNovo saldo é " + account.getBalance() + "MZN";
        messagingTemplate.convertAndSend("/topic/transaction/" + accountNumber, message);
    }

    public void getBankAccountInfo(String accountNumber) throws InterruptedException, ExecutionException {
        DocumentReference docRef = db.collection("bankAccount").document(accountNumber);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();

        if (!document.exists()) {
            System.out.println("Account with ID " + accountNumber + " does not exists.");
        }

        BankAccount account = document.toObject(BankAccount.class);
        Map<String, Object> accountInfo = new HashMap<>();
        accountInfo.put("accountNumber", account.getAccountNumber());
        accountInfo.put("clientName", account.getClient().getName());
        accountInfo.put("balance", account.getBalance());
        accountInfo.put("createdAt", account.getCreatedAt());

        messagingTemplate.convertAndSend("/topic/transaction/" + accountNumber, accountInfo);
    }
    // public BankAccount createBankAccount(BankAccount bankAccount) {
    // return repository.save(bankAccount);
    // }
    // public void createBankAccount(BankAccount bankAccount) throws Exception {
    // databaseReference.child(bankAccount.getAccountNumber()).setValueAsync(bankAccount).get();
    // }

    // public BankAccount getBankAccountById(String id) {
    // return repository.findById(id).orElse(null);
    // }
    // public BankAccount getBankAccountById(String id) {
    // return databaseReference.child(id).getValue(BankAccount.class);
    // }

    // public List<BankAccount> getAllBankAccounts() {
    // return repository.findAll();
    // }

    // public BankAccount updateBankAccount(String id, BankAccount bankAccount) {
    // if (!repository.existsById(id)) {
    // return null;
    // }
    // bankAccount.setAccountNumber(id);
    // return repository.save(bankAccount);
    // }

    // public boolean deleteBankAccount(String id) {
    // if (!repository.existsById(id)) {
    // return false;
    // }
    // repository.deleteById(id);
    // return true;
    // }

    // public void transferFunds(String fromAccountId, String toAccountId, double
    // amount) {
    // BankAccount fromAccount = getBankAccountById(fromAccountId);
    // BankAccount toAccount = getBankAccountById(toAccountId);

    // if (fromAccount == null || toAccount == null) {
    // throw new IllegalArgumentException("Invalid account IDs");
    // }

    // if (fromAccount.getBalance() < amount) {
    // throw new IllegalArgumentException("Insufficient funds");
    // }

    // fromAccount.setBalance(fromAccount.getBalance() - amount);
    // toAccount.setBalance(toAccount.getBalance() + amount);

    // updateBankAccount(fromAccountId, fromAccount);
    // updateBankAccount(toAccountId, toAccount);
    // }

    // public void deposit(String accountId, double amount) {
    // BankAccount account = getBankAccountById(accountId);
    // if (account == null) {
    // throw new IllegalArgumentException("Invalid account ID");
    // }
    // account.setBalance(account.getBalance() + amount);
    // updateBankAccount(accountId, account);
    // }

    // public void withdraw(String accountId, double amount) {
    // BankAccount account = getBankAccountById(accountId);
    // if (account == null) {
    // throw new IllegalArgumentException("Invalid account ID");
    // }
    // if (account.getBalance() < amount) {
    // throw new IllegalArgumentException("Insufficient funds");
    // }
    // account.setBalance(account.getBalance() - amount);
    // updateBankAccount(accountId, account);
    // }
    // public double checkBalance(String accountNumber) {
    // BankAccount account = getBankAccountById(accountNumber);
    // if (account == null) {
    // throw new IllegalArgumentException("Invalid account ID");
    // }
    // return account.getBalance();
    // }
}
