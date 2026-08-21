package com.ticket.notification.service;
import com.cloudhopper.smpp.SmppBindType;
import com.cloudhopper.smpp.SmppConstants;
import com.cloudhopper.smpp.SmppSession;
import com.cloudhopper.smpp.SmppSessionConfiguration;
import com.cloudhopper.smpp.impl.DefaultSmppClient;
import com.cloudhopper.smpp.impl.DefaultSmppSessionHandler;
import com.cloudhopper.smpp.pdu.SubmitSm;
import com.cloudhopper.smpp.pdu.SubmitSmResp;
import com.cloudhopper.smpp.type.Address;
import io.netty.channel.nio.NioEventLoopGroup;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;

@Service
public class SmppService {
    @Value("${smpp.host}") private String host;
    @Value("${smpp.port}") private int port;
    @Value("${smpp.system-id}") private String systemId;
    @Value("${smpp.password}") private String password;
    @Value("${smpp.system-type}") private String systemType;
    @Value("${smpp.source-address}") private String sourceAddress;
    @Value("${smpp.ton}") private byte ton;
    @Value("${smpp.npi}") private byte npi;

    private DefaultSmppClient smppClient;
    private SmppSession smppSession;
    private NioEventLoopGroup workerGroup;

    @PostConstruct
    public void init() {
        this.workerGroup = new NioEventLoopGroup(1);
        this.smppClient = new DefaultSmppClient(this.workerGroup);
        connectAsync();
    }
    private synchronized void connectAsync() {
        Executors.newSingleThreadExecutor().submit(() -> {
            try {
                SmppSessionConfiguration config = new SmppSessionConfiguration();
                config.setType(SmppBindType.TRANSCEIVER);
                config.setHost(host); config.setPort(port); config.setSystemId(systemId); config.setPassword(password);
                this.smppSession = smppClient.bind(config, new DefaultSmppSessionHandler());
            } catch(Exception e) { System.err.println("SMPP bind failed"); }
        });
    }
    @Async
    public void sendSms(String mobileNumber, String text) {
        if (smppSession == null || !smppSession.isBound()) return;
        try {
            SubmitSm sm = new SubmitSm();
            sm.setSourceAddress(new Address(ton, npi, sourceAddress));
            sm.setDestAddress(new Address(ton, npi, mobileNumber));
            sm.setShortMessage(text.getBytes(StandardCharsets.UTF_8));
            sm.setDataCoding((byte)0);
            smppSession.submit(sm, 5000);
        } catch(Exception e) { System.err.println(e.getMessage()); }
    }
    @PreDestroy
    public void teardown() {
        if (smppSession != null) { smppSession.unbind(5000); smppSession.destroy(); }
        if (smppClient != null) smppClient.destroy();
        if (workerGroup != null) workerGroup.shutdownGracefully();
    }
}