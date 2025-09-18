package com.sd.demo.controller;

import java.util.List;
import java.util.concurrent.ExecutionException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sd.demo.model.BankAccount;
import com.sd.demo.model.dto.TransferRequest;
import com.sd.demo.service.BankAccountService;

@RestController
@RequestMapping("/api/bank-accounts")
public class BankAccountController {
    private final BankAccountService service;

    public BankAccountController(BankAccountService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<BankAccount> getBankAccountById(@PathVariable String id) throws InterruptedException, ExecutionException {
        BankAccount account = service.getBankAccount(id);
        if (account == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(account);
    }

    @GetMapping
    public ResponseEntity<List<BankAccount>> getAllBankAccounts() throws InterruptedException, ExecutionException {
        List<BankAccount> accounts = service.getAllAccounts();
        return ResponseEntity.ok(accounts);
    }

    @PostMapping("/{clientId}")
    public ResponseEntity<BankAccount> createBankAccount(@PathVariable String clientId, @RequestBody BankAccount bankAccount) throws InterruptedException, ExecutionException {
        BankAccount createdAccount = service.addBankAccount(clientId, bankAccount);
        return ResponseEntity.ok(createdAccount);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BankAccount> updateBankAccount(@PathVariable String id, @RequestBody BankAccount bankAccount) throws InterruptedException, ExecutionException {
        BankAccount updatedAccount = service.updateBankAccount(bankAccount);
        if (updatedAccount == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedAccount);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBankAccount(@PathVariable String id) throws InterruptedException, ExecutionException {
        if (service.deleteBankAccount(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/transfer")
    public ResponseEntity<String> transferFunds(@PathVariable String id, @RequestBody TransferRequest request) throws InterruptedException, ExecutionException {
        try {
            service.transferFunds(id, request.getAccountNumberTo(), request.getAmount());
            String message = "You successfully transferred " + request.getAmount() + " from account " + id + " to account " + request.getAccountNumberTo();
            return ResponseEntity.ok(message);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    // @PostMapping("/{id}/transfer")
    // public ResponseEntity<String> transferFunds(@PathVariable String id, @RequestBody TransferRequest request) throws InterruptedException, ExecutionException {
    //     try {
    //         String response = service.transferFunds(id, request.getAccountNumberTo(), request.getAmount());
    //         return ResponseEntity.ok(response);
    //     } catch (IllegalArgumentException e) {
    //         return ResponseEntity.badRequest().build();
    //     }
    // }

    @PostMapping("/{id}/deposit")
    public ResponseEntity<String> depositFunds(@PathVariable String id, @RequestBody double amount) throws InterruptedException, ExecutionException {
        try {
            service.depositFunds(id, amount);
            String message = "You successfully deposited " + amount + " into account " + id;
            return ResponseEntity.ok(message);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    // @PostMapping("/{id}/deposit")
    // public ResponseEntity<String> depositFunds(@PathVariable String id, @RequestBody double amount) throws InterruptedException, ExecutionException {
    //     try {
    //         String response = service.depositFunds(id, amount);
    //         return ResponseEntity.ok(response);
    //     } catch (IllegalArgumentException e) {
    //         return ResponseEntity.badRequest().build();
    //     }
    // }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<String> withdrawFunds(@PathVariable String id, @RequestBody double amount) throws InterruptedException, ExecutionException {
        try {
            service.withdraw(id, amount);
            String message = "You successfully withdrew " + amount + " from account " + id;
            return ResponseEntity.ok(message);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    // @PostMapping("/{id}/withdraw")
    // public ResponseEntity<String> withdrawFunds(@PathVariable String id, @RequestBody double amount) throws InterruptedException, ExecutionException {
    //     try {
    //         String response = service.withdraw(id, amount);
    //         return ResponseEntity.ok(response);
    //     } catch (IllegalArgumentException e) {
    //         return ResponseEntity.badRequest().build();
    //     }
    // }

    @GetMapping("/{id}/check-balance")
    public ResponseEntity<String> checkBalance(@PathVariable String id) throws InterruptedException, ExecutionException {
        try {
            String response = service.checkBalance(id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
