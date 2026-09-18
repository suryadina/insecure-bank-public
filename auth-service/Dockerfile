FROM gradle:8.5-jdk17-alpine AS builder

WORKDIR /app

COPY build.gradle.kts .
COPY src src

RUN gradle build -x test --no-daemon

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN mkdir -p /app/data

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

CMD ["java", "-Xmx512m", "-Xms128m", "-jar", "app.jar"]