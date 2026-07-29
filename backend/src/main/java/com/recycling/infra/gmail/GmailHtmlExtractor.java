package com.recycling.infra.gmail;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import com.google.api.services.gmail.model.Message;
import com.google.api.services.gmail.model.MessagePart;
import com.google.api.services.gmail.model.MessagePartBody;


public class GmailHtmlExtractor {

    public static String extracHtml(Message message) {
        if (message == null || message.getPayload() == null)
            return null;
        return extractFromPart(message.getPayload());
    }

    private static String extractFromPart(MessagePart part) {
        if (part == null)
            return null;

        String mimeType = part.getMimeType();
        MessagePartBody body = part.getBody();

        if ("text/html".equalsIgnoreCase(mimeType) && body != null && body.getData() != null) {
            return decodeBase64(body.getData());
        }

        if ("text/plain".equalsIgnoreCase(mimeType) && body != null && body.getData() != null) {
            return "<pre>" + decodeBase64(body.getData()) + "</pre>";
        }

        if (part.getParts() != null) {
            for (MessagePart subPart : part.getParts()) {
                String html = extractFromPart(subPart);
                if (html != null)
                    return html;
            }
        }
        return null;
    }

    private static String decodeBase64(String base64) {
        byte[] bytes = Base64.getUrlDecoder().decode(base64);
        return new String(bytes, StandardCharsets.UTF_8);
    }
}