package com.totospizza.config;

import java.util.List;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.totospizza.security.handler.RestAccessDeniedHandler;
import com.totospizza.security.handler.RestAuthenticationEntryPoint;
import com.totospizza.security.userdetails.JwtUsuarioConverter;

@Configuration
@EnableMethodSecurity
@EnableConfigurationProperties({JwtProperties.class, CorsProperties.class})
public class SecurityConfig {

    private static final String[] RUTAS_PUBLICAS = {"/api/v1/publico/**", "/api/v1/auth/**", "/actuator/health"};
    private static final String[] RUTAS_CON_SESION = {"/api/v1/auth/logout", "/api/v1/auth/cambiar-contrasena"};

    @Bean
    public SecurityFilterChain filtros(HttpSecurity http, JwtUsuarioConverter conversor,
                                       RestAuthenticationEntryPoint noAutenticado,
                                       RestAccessDeniedHandler accesoDenegado) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(sesion -> sesion.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(rutas -> rutas
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(RUTAS_CON_SESION).authenticated()
                        .requestMatchers(RUTAS_PUBLICAS).permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(errores -> errores
                        .authenticationEntryPoint(noAutenticado)
                        .accessDeniedHandler(accesoDenegado))
                .oauth2ResourceServer(recurso -> recurso
                        .authenticationEntryPoint(noAutenticado)
                        .accessDeniedHandler(accesoDenegado)
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(conversor)));
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(CorsProperties propiedades) {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(propiedades.origenesPermitidos());
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        cors.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource origen = new UrlBasedCorsConfigurationSource();
        origen.registerCorsConfiguration("/api/**", cors);
        return origen;
    }
}
