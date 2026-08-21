package com.ticket.booking.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.annotation.Configuration;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Optional;

@Slf4j
@Configuration
public class DatabaseInitializer implements BeanFactoryPostProcessor {

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        // Java 21 Optional handling blocks process dynamic environment fallbacks smoothly
        String datasourceUrl = Optional.ofNullable(System.getenv("SPRING_DATASOURCE_URL")).orElse("");

        String osHost = datasourceUrl.contains("host.docker.internal") ? "host.docker.internal" : "localhost";
        String maintenanceUrl = "jdbc:postgresql://" + osHost + ":5432/postgres";

        String dbUser = Optional.ofNullable(System.getenv("SPRING_DATASOURCE_USERNAME")).orElse("postgres");
        String dbPass = Optional.ofNullable(System.getenv("SPRING_DATASOURCE_PASSWORD")).orElse("system");

        log.info("Executing early database validation sweep targeting: {}", maintenanceUrl);

        try (Connection conn = DriverManager.getConnection(maintenanceUrl, dbUser, dbPass);
             Statement stmt = conn.createStatement()) {

            // Evaluates presence of target relational schemas
            try (ResultSet rs = stmt.executeQuery("SELECT 1 FROM pg_database WHERE datname = 'ticket_db'")) {
                if (!rs.next()) {
                    log.info("Database 'ticket_db' not found. Creating database framework...");
                    stmt.executeUpdate("CREATE DATABASE ticket_db");
                    log.info("Database 'ticket_db' created successfully.");
                } else {
                    log.info("Database 'ticket_db' exists on host machine. Skipping creation loop.");
                }
            }

        } catch (Exception e) {
            log.error("Early database verification failed: {}", e.getMessage());
        }
    }
}
