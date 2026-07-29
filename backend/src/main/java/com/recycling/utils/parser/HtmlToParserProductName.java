package com.recycling.utils.parser;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import com.recycling.dto.ParserToOrderInfoDto;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class HtmlToParserProductName {

    public List<ParserToOrderInfoDto> parserBaemin(String html, ZonedDateTime orderTime, String mailId) {

        List<ParserToOrderInfoDto> result = new ArrayList<>();
        Document doc = Jsoup.parse(html);

        Element orderDiv = doc.select("div:contains(주문상품 정보)").first();
        Element orderTable = orderDiv.selectFirst("table");
        Elements rows = orderTable.select("tbody tr");

        for (Element row : rows) {
            Elements cols = row.select("td");
            if (cols.size() >= 3) {

                ParserToOrderInfoDto ptod = ParserToOrderInfoDto.builder()
                    .mailId(mailId)
                    .productName(cols.get(0).text())
                    .orderTime(orderTime)
                    .build();

                result.add(ptod);
            }
        }

        return result;
    }

    public List<ParserToOrderInfoDto> parserCoupang(String html, ZonedDateTime orderTime, String mailId) {

    List<ParserToOrderInfoDto> result = new ArrayList<>();
        
        if (html == null || html.isEmpty()) {
            return result;
        }

        Document doc = Jsoup.parse(html);

        // 구형(vendor-item-table)과 신형(item-table) 선택자를 모두 탐색
        Elements tables = doc.select("table.item-table, table.vendor-item-table");

        for (Element table : tables) {
            // 실제 상품 데이터가 담긴 tbody 또는 tr을 타겟팅
            Elements rows = table.select("tbody > tr, tr");
            
            for (Element row : rows) {
                // 1. 신형 포맷: span.col-title 매핑 시도
                Element productNameElement = row.selectFirst("span.col-title");
                
                // 2. 구형 포맷: span.col-title이 없다면 스타일 기반으로 감싸진 span 탐색 (padding-left 속성 포함)
                if (productNameElement == null) {
                    productNameElement = row.selectFirst("span[style*=padding-left]");
                }
                
                // 3. 둘 다 해당하지 않는 행(헤더 행, 빈 행 등)은 무시
                if (productNameElement == null) {
                    continue;
                }
                
                String productName = productNameElement.text().trim();
                if (productName.isEmpty()) {
                    continue;
                }

                ParserToOrderInfoDto ptod = ParserToOrderInfoDto.builder()
                    .mailId(mailId)
                    .productName(productName)
                    .orderTime(orderTime)
                    .build();
                    
                result.add(ptod);
            }
        }
        
        return result;
    }

    public List<ParserToOrderInfoDto> parserKerly(String html, ZonedDateTime orderTime, String mailId) {
        List<ParserToOrderInfoDto> result = new ArrayList<>();
        Document doc = Jsoup.parse(html);

        Elements rows = doc.select("table tbody tr");

        for (Element row : rows) {
            Elements cols = row.select("td");

            if (cols.size() >= 5 && !(row.text().contains("총 결제금액"))) {

                ParserToOrderInfoDto ptod = ParserToOrderInfoDto.builder()
                        .mailId(mailId)
                        .productName(cols.get(1).text())
                        .orderTime(orderTime)
                        .build();
                result.add(ptod);
            }
        }

        return result;
    }

}
