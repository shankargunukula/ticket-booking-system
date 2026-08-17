package com.ticket.booking.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.annotation.Configuration;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

@Configuration
public class DatabaseInitializer implements BeanFactoryPostProcessor {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializer.class);

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        // Evaluate your environment host pointer (Docker vs local execution)
        String osHost = System.getenv("SPRING_DATASOURCE_URL") != null ? "host.docker.internal" : "localhost";
        String maintenanceUrl = "jdbc:postgresql://" + osHost + ":5432/postgres";

        // Grab credentials out of systemic environment blocks or use your native defaults
        String dbUser = System.getenv("SPRING_DATASOURCE_USERNAME") != null ? System.getenv("SPRING_DATASOURCE_USERNAME") : "postgres";
        String dbPass = System.getenv("SPRING_DATASOURCE_PASSWORD") != null ? System.getenv("SPRING_DATASOURCE_PASSWORD") : "system";

        log.info("Executing early database validation sweep targeting: {}", maintenanceUrl);

        try (Connection conn = DriverManager.getConnection(maintenanceUrl, dbUser, dbPass);
             Statement stmt = conn.createStatement()) {

            // Check if ticket_db database exists natively on the host machine
            ResultSet rs = stmt.executeQuery("SELECT 1 FROM pg_database WHERE datname = 'ticket_db'");

            if (!rs.next()) {
                log.info("Database 'ticket_db' not found. Creating database framework...");
                stmt.executeUpdate("CREATE DATABASE ticket_db");
                log.info("Database 'ticket_db' created successfully.");
            } else {
                log.info("Database 'ticket_db' exists on host machine. Skipping creation loop.");
            }

        } catch (Exception e) {
            log.error("Early database verification failed: {}", e.getMessage());
        }
    }
}
