package com.ticket.booking.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    // 1. INJECT HIGH-PERFORMANCE ASYNCHRONOUS LETTUCE CLIENT DRIVER
    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        // Leverages standard loopbacks targeting default port '6379'
        return new LettuceConnectionFactory("127.0.0.1", 6379);
    }

    // 2. UNIFIED STRING TRANSACTION TEMPLATE (Utilized inside BookingService)
    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        return new StringRedisTemplate(connectionFactory);
    }

    // 3. GENERIC OBJECT TEMPLATE CONFIGURATION MAPPING OVERRIDES
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        var template = new RedisTemplate<String, Object>();
        template.setConnectionFactory(connectionFactory);

        // Clean String normalization models protecting cache visibility boundaries
        var stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setValueSerializer(stringSerializer);
        template.setHashValueSerializer(stringSerializer);

        template.afterPropertiesSet();
        return template;
    }
}
