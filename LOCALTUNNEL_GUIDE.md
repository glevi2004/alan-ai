# 🌐 Localtunnel Guide

This guide explains how to use **localtunnel** to expose your local development server to the internet, making it accessible from cloud services like n8n, webhooks, or external APIs.

## 📋 What is Localtunnel?

**Localtunnel** is a free, open-source tool that creates a secure tunnel to your localhost, allowing external services to access your local development server. It's perfect for:

- Testing webhooks with external services
- Sharing your local development with clients
- Integrating with cloud-based tools (like n8n)
- Mobile app testing on real devices
- API testing from external services

## 🚀 Installation

### Using npm (Recommended)

```bash
npm install -g localtunnel
```

### Using Homebrew (macOS)

```bash
brew install localtunnel
```

## 🔧 Basic Usage

### 1. Start Your Local Server

First, make sure your local development server is running:

```bash
npm run dev
# Your app should be running on http://localhost:3000
```

### 2. Create a Tunnel

Open a new terminal window and run:

```bash
lt --port 3000
```

This will:

- Create a tunnel to your localhost:3000
- Generate a random public URL (e.g., `https://abc123.loca.lt`)
- Display the URL in the terminal

### 3. Use a Custom Subdomain (Optional)

For consistent URLs, you can specify a subdomain:

```bash
lt --port 3000 --subdomain alan-ai-calendar
```

This creates: `https://alan-ai-calendar.loca.lt`

## 📝 Complete Example

### Step 1: Start Your Next.js App

```bash
# Terminal 1
cd /path/to/your/project
npm run dev
```

### Step 2: Start Localtunnel

```bash
# Terminal 2
lt --port 3000 --subdomain alan-ai-calendar
```

Output:

```
your url is: https://alan-ai-calendar.loca.lt
```

### Step 3: Test the Tunnel

```bash
# Test your API endpoint
curl https://alan-ai-calendar.loca.lt/api/calendar/events
```

## 🔗 Integration with n8n

### For Cloud n8n Instances

When your n8n is running in the cloud (like Hostinger VPS), use the localtunnel URL:

**HTTP Request Node Configuration:**

- **URL**: `https://alan-ai-calendar.loca.lt/api/calendar/events`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**:

```json
{
  "userId": "coNotR4863aNxvIcIddIFxXfYdY2",
  "summary": "{{$json.summary}}",
  "description": "{{$json.description}}",
  "startDateTime": "{{$json.startDateTime}}",
  "endDateTime": "{{$json.endDateTime}}",
  "timeZone": "{{$json.timeZone}}",
  "attendees": {{$json.attendees}}
}
```

## ⚙️ Advanced Configuration

### Custom Port

```bash
lt --port 8080
```

### Custom Subdomain

```bash
lt --port 3000 --subdomain my-app
```

### Local Host

```bash
lt --port 3000 --local-host 127.0.0.1
```

### Allow Invalid Certificates

```bash
lt --port 3000 --allow-invalid-cert
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "Port already in use"

```bash
# Check what's using the port
lsof -i :3000

# Kill the process or use a different port
lt --port 3001
```

#### 2. "Subdomain already taken"

```bash
# Use a different subdomain
lt --port 3000 --subdomain my-app-123
```

#### 3. "Connection refused"

- Make sure your local server is running
- Check the port number
- Verify firewall settings

#### 4. "Tunnel not accessible"

- Wait a few seconds for the tunnel to establish
- Check if localtunnel service is down
- Try a different subdomain

### Debug Mode

```bash
lt --port 3000 --debug
```

## 🔒 Security Considerations

### Important Notes:

1. **Public Access**: Anyone with the URL can access your local server
2. **Development Only**: Don't use localtunnel for production
3. **Sensitive Data**: Be careful with sensitive information
4. **Temporary URLs**: URLs change when you restart localtunnel

### Best Practices:

- Use random subdomains for sensitive testing
- Don't expose production databases
- Monitor your tunnel usage
- Use HTTPS endpoints when possible

## 📊 Monitoring

### Check Tunnel Status

```bash
# The tunnel process shows connection status
lt --port 3000 --subdomain alan-ai-calendar
```

### View Logs

```bash
# Enable debug mode for detailed logs
lt --port 3000 --debug
```

## 🔄 Alternative Tools

### 1. ngrok (Paid/Free with limits)

```bash
# Requires authentication
ngrok http 3000
```

### 2. serveo (Free)

```bash
ssh -R 80:localhost:3000 serveo.net
```

### 3. Cloudflare Tunnel (Free)

```bash
# Install cloudflared
cloudflared tunnel --url http://localhost:3000
```

## 🎯 Use Cases

### 1. Webhook Testing

```bash
# Expose your webhook endpoint
lt --port 3000 --subdomain webhook-test
```

### 2. API Integration

```bash
# Expose your API for external services
lt --port 3000 --subdomain api-dev
```

### 3. Mobile Testing

```bash
# Test mobile apps on real devices
lt --port 3000 --subdomain mobile-test
```

### 4. Client Demos

```bash
# Share your work-in-progress
lt --port 3000 --subdomain client-demo
```

## 📝 Scripts for Automation

### Start Script (start-tunnel.sh)

```bash
#!/bin/bash
echo "Starting localtunnel..."
lt --port 3000 --subdomain alan-ai-calendar
```

### Package.json Script

```json
{
  "scripts": {
    "tunnel": "lt --port 3000 --subdomain alan-ai-calendar",
    "dev:tunnel": "concurrently \"npm run dev\" \"npm run tunnel\""
  }
}
```

## 🚨 Important Warnings

1. **Don't use for production** - Localtunnel is for development only
2. **URLs are temporary** - They change when you restart the tunnel
3. **Public access** - Anyone with the URL can access your server
4. **Rate limits** - Free services may have usage limits
5. **Service availability** - Localtunnel may be down occasionally

## 📞 Support

### Localtunnel Issues

- GitHub: https://github.com/localtunnel/localtunnel
- Issues: https://github.com/localtunnel/localtunnel/issues

### Alternative Services

- ngrok: https://ngrok.com/
- Cloudflare Tunnel: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/

---

**Happy tunneling! 🚀**
