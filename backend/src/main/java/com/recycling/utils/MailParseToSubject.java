package com.recycling.utils;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

import org.springframework.stereotype.Component;

import com.google.api.services.gmail.model.Message;
import com.google.api.services.gmail.model.MessagePartHeader;
import com.recycling.dto.ParserToOrderInfoDto;
import com.recycling.infra.gmail.GmailHtmlExtractor;
import com.recycling.utils.parser.HtmlToParserProductName;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;

@Component
@RequiredArgsConstructor
public class MailParseToSubject {

    private final HtmlToParserProductName htmlToParserProductName;
    
    public Flux<ParserToOrderInfoDto> parseMailToOrder(Message message) {

        String from = getHeader(message, "From");
        String subject = getHeader(message, "Subject");
        ZonedDateTime orderTime = parsOrderTime(message);
        String html = GmailHtmlExtractor.extracHtml(message);

        if (from.contains("coupang.com") || subject.contains("쿠팡")) {
            List<ParserToOrderInfoDto> list = htmlToParserProductName.parserCoupang(html, orderTime, message.getId());
            return Flux.fromIterable(list);
        } else if (from.contains("woowahan.com") || subject.contains("배민 장보기")) {
            List<ParserToOrderInfoDto> list = htmlToParserProductName.parserBaemin(html, orderTime, message.getId());
            return Flux.fromIterable(list);
        } else if (from.contains("kurly.com") || subject.contains("컬리")) {
            List<ParserToOrderInfoDto> list = htmlToParserProductName.parserKerly(html, orderTime, message.getId());
            return Flux.fromIterable(list);
        } else {            
            return Flux.empty();
        }
    }

    private String getHeader(Message message, String reqName) {

        return message.getPayload().getHeaders().stream()
                .filter(h -> h.getName().equalsIgnoreCase(reqName))
                .map(MessagePartHeader::getValue)
                .findFirst()
                .orElse("");
    }

    private ZonedDateTime parsOrderTime(Message message) {

        Long messageInternalDateTime = message.getInternalDate();

        Instant instant = Instant.ofEpochMilli(messageInternalDateTime);
        ZoneId seoulZone = ZoneId.of("Asia/Seoul");

        ZonedDateTime orderTime = instant.atZone(seoulZone);

        return orderTime;
    }
}
