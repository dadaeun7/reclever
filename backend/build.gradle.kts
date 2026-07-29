plugins {
	java
	id("org.springframework.boot") version "3.4.7"
	id("io.spring.dependency-management") version "1.1.7"
}

group = "com.recycling"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(17)
	}
}

repositories {
	mavenCentral();
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-data-redis-reactive")
	implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
	implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("org.springframework.boot:spring-boot-starter-webflux")
	implementation("org.springframework.boot:spring-boot-starter-data-r2dbc")
	implementation("org.postgresql:r2dbc-postgresql")
	implementation("io.r2dbc:r2dbc-pool")
	implementation("io.jsonwebtoken:jjwt-api:0.11.5")
	implementation("org.jsoup:jsoup:1.17.2")
	implementation("com.google.apis:google-api-services-gmail:v1-rev110-1.25.0")

	runtimeOnly("io.jsonwebtoken:jjwt-impl:0.11.5")
	runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.11.5")
	compileOnly("org.projectlombok:lombok")
	annotationProcessor("org.projectlombok:lombok")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testImplementation("io.projectreactor:reactor-test")
}

tasks.withType<Test> {
	useJUnitPlatform()
}
