package com.sd.demo.controller;

import java.util.concurrent.ExecutionException;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import com.sd.demo.model.dto.TransferRequest;
import com.sd.demo.service.BankAccountService;

@Controller
public class BankWebSocketController {

    private final BankAccountService bankAccountService;

    public BankWebSocketController(BankAccountService bankAccountService) {
        this.bankAccountService = bankAccountService;
    }

    @MessageMapping("/deposit/{accountNumber}")
    public void deposit(@DestinationVariable String accountNumber, double amount) throws InterruptedException, ExecutionException {
        bankAccountService.depositFunds(accountNumber, amount);
    }

    @MessageMapping("/withdraw/{accountNumber}")
    public void withdraw(@DestinationVariable String accountNumber, double amount) throws InterruptedException, ExecutionException {
        bankAccountService.withdraw(accountNumber, amount);
    }

    @MessageMapping("/transfer/{fromAccountNumber}")
    public void transfer(@DestinationVariable String fromAccountNumber, TransferRequest payload) throws InterruptedException, ExecutionException {
        double amount = payload.getAmount();
        String toAccountNumber = payload.getAccountNumberTo();
        bankAccountService.transferFunds(fromAccountNumber, toAccountNumber, amount);
    }

    @MessageMapping("/account-info/{accountNumber}")
    public void getAccountInfo(@DestinationVariable String accountNumber) throws InterruptedException, ExecutionException {
        bankAccountService.getBankAccountInfo(accountNumber);
    }

}
