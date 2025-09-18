package com.sd.demo.shared;

import java.util.UUID;

public class Utils {

    public static String generateRandomId() {
        return UUID.randomUUID().toString();
    }
}
