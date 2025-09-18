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

import com.sd.demo.model.Client;
import com.sd.demo.service.ClientService;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/clients")
public class ClientController {
    private final ClientService service;

    public ClientController(ClientService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable String id) throws InterruptedException, ExecutionException {
        Client client = service.getClientById(id);

        return ResponseEntity.ok(client);
    }

    @GetMapping
    public ResponseEntity<List<Client>> getAllClients() throws InterruptedException, ExecutionException {
        List<Client> clients = service.getAllClients();
        return ResponseEntity.ok(clients);
    }
    

    @PostMapping
    public ResponseEntity<Client> createClient(@RequestBody Client client) throws InterruptedException, ExecutionException {
        Client createdClient = service.addClient(client);
        return ResponseEntity.ok(createdClient);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Client> updateClient(@PathVariable String id, @RequestBody Client client) throws InterruptedException, ExecutionException {
        Client updatedClient = service.updateClient(client);
        if (updatedClient == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedClient);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable String id) throws InterruptedException, ExecutionException {
        if (service.deleteClientById(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/test")
    public String test() {
        System.out.println("Testing api");
        return "Test successful";
    }
    
}
