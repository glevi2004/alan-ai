# 🚀 n8n Integration Guide for Google Calendar

This guide will help you set up n8n workflows to integrate with your Google Calendar through the provided API endpoints.

## 📋 Prerequisites

1. **Google Calendar Connected**: Ensure you've connected your Google Calendar in the app first
2. **User ID**: You'll need your Firebase user ID (found in the browser console or app logs)
3. **n8n Instance**: A running n8n instance (cloud or self-hosted)

## 🔗 Available API Endpoints

### 1. **Chat API** - Send Messages with Timezone

```
POST https://your-domain.com/api/chat
```

**Request Body:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Schedule a meeting for tomorrow at 2pm"
    }
  ],
  "chatId": "chat-123",
  "userId": "your-firebase-user-id"
}
```

**n8n Webhook Payload (sent to your n8n webhook):**

```json
{
  "app_source": "alan-ai-webapp",
  "user_id": "your-firebase-user-id",
  "chat_id": "chat-123",
  "conversation_id": "conv_user-123_1703123456789",
  "message": "Schedule a meeting for tomorrow at 2pm",
  "timestamp": "1703123456789",
  "message_id": "msg_1703123456789",
  "user_timezone": "America/Sao_Paulo"
}
```

### 2. **Token Endpoint** - Get Access Token

```
GET https://your-domain.com/api/oauth/token?userId=YOUR_USER_ID
```

**Response:**

```json
{
  "access_token": "ya29.a0AfB_byC...",
  "expires_in": 3600
}
```

### 3. **Calendar Events Endpoint** - Create Events

```
POST https://your-domain.com/api/calendar/events
```

**Request Body:**

```json
{
  "userId": "your-firebase-user-id",
  "summary": "Team Meeting",
  "description": "Weekly team sync meeting",
  "startDateTime": "2024-01-15T10:00:00-07:00",
  "endDateTime": "2024-01-15T11:00:00-07:00",
  "timeZone": "America/Los_Angeles",
  "attendees": [{ "email": "team@company.com" }]
}
```

**Response:**

```json
{
  "success": true,
  "event": {
    "id": "event_id_123",
    "summary": "Team Meeting",
    "start": {
      "dateTime": "2024-01-15T10:00:00-07:00",
      "timeZone": "America/Los_Angeles"
    },
    "end": {
      "dateTime": "2024-01-15T11:00:00-07:00",
      "timeZone": "America/Los_Angeles"
    },
    "htmlLink": "https://calendar.google.com/calendar/event?eid=..."
  }
}
```

### 4. **Calendar Settings Endpoint** - Get User's Calendar Settings

```
GET https://your-domain.com/api/calendar/settings?userId=YOUR_USER_ID
```

**Response:**

```json
{
  "success": true,
  "settings": {
    "timeZone": "America/Sao_Paulo",
    "summary": "Primary Calendar",
    "description": "User's primary Google Calendar"
  }
}
```

### 5. **Calendar Events Endpoint** - Get Events

```
GET https://your-domain.com/api/calendar/events?userId=YOUR_USER_ID&timeMin=2024-01-01T00:00:00Z&timeMax=2024-01-31T23:59:59Z
```

## 🔧 n8n Workflow Setup

### **Workflow 1: AI Agent with Timezone-Aware Calendar Integration**

This is the recommended workflow for AI agents that need to create calendar events:

1. **Webhook Trigger** - Chat Message

   - **Method**: `POST`
   - **Path**: `/ai-agent-chat`
   - **Receives**: User message with timezone information

2. **AI Processing Node**

   - Process the user message: `{{ $json.body.message }}`
   - Access user timezone: `{{ $json.body.user_timezone }}`
   - Access user ID: `{{ $json.body.user_id }}`

3. **HTTP Request Node** - Create Calendar Event (when needed)

   - **Method**: `POST`
   - **URL**: `https://your-domain.com/api/calendar/events`
   - **Content-Type**: `application/json`
   - **Body**:

   ```json
   {
     "userId": "{{ $json.body.user_id }}",
     "summary": "Event Title",
     "description": "Event description",
     "startDateTime": "2024-01-15T10:00:00-07:00",
     "endDateTime": "2024-01-15T11:00:00-07:00",
     "timeZone": "{{ $json.body.user_timezone }}",
     "attendees": []
   }
   ```

4. **Response Node**
   - Return AI response to user

### **Workflow 2: Direct Calendar Event Creation**

For direct calendar event creation without AI processing:

1. **Webhook Trigger**

   - **Method**: `POST`
   - **Path**: `/create-event`

2. **HTTP Request Node** - Create Event

   - **Method**: `POST`
   - **URL**: `https://your-domain.com/api/calendar/events`
   - **Content-Type**: `application/json`
   - **Body**:

   ```json
   {
     "userId": "{{ $json.userId }}",
     "summary": "{{ $json.summary }}",
     "description": "{{ $json.description }}",
     "startDateTime": "{{ $json.startDateTime }}",
     "endDateTime": "{{ $json.endDateTime }}",
     "timeZone": "{{ $json.timeZone }}",
     "attendees": {{ $json.attendees }}
   }
   ```

3. **Response Node**
   - Return the event creation result

### **Workflow 3: Advanced with Token Refresh**

For workflows that need direct Google Calendar API access:

1. **Webhook Trigger**

   - **Method**: `POST`
   - **Path**: `/create-event-advanced`

2. **HTTP Request Node** - Get Access Token

   - **Method**: `GET`
   - **URL**: `https://your-domain.com/api/oauth/token?userId={{ $json.userId }}`

3. **HTTP Request Node** - Create Event via Google API

   - **Method**: `POST`
   - **URL**: `https://www.googleapis.com/calendar/v3/calendars/primary/events`
   - **Authentication**: `Header Auth`
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer {{ $json.access_token }}`
   - **Content-Type**: `application/json`
   - **Body**:

   ```json
   {
     "summary": "{{ $json.summary }}",
     "description": "{{ $json.description }}",
     "start": {
       "dateTime": "{{ $json.startDateTime }}",
       "timeZone": "{{ $json.timeZone }}"
     },
     "end": {
       "dateTime": "{{ $json.endDateTime }}",
       "timeZone": "{{ $json.timeZone }}"
     },
     "attendees": {{ $json.attendees }},
     "reminders": {
       "useDefault": false,
       "overrides": [
         {"method": "email", "minutes": 24 * 60},
         {"method": "popup", "minutes": 10}
       ]
     }
   }
   ```

4. **Response Node**
   - Return the event creation result

## 🤖 AI Agent Integration

### **User Timezone in Chat Messages**

The user's timezone is automatically included in every chat message sent to n8n, allowing your AI agent to provide timezone-aware responses:

#### **Chat Message Format**

When a user sends a message through the chat interface, the following data is sent to n8n:

```json
{
  "app_source": "alan-ai-webapp",
  "user_id": "user-firebase-id",
  "chat_id": "chat-123",
  "conversation_id": "conv_user-123_1703123456789",
  "message": "Schedule a meeting for tomorrow at 2pm",
  "timestamp": "1703123456789",
  "message_id": "msg_1703123456789",
  "user_timezone": "America/Sao_Paulo"
}
```

#### **AI Agent Prompt for Calendar Event Creation**

````
You are talking to the user with userId: {{ $json.body.user_id }}
Date and Time: {{ $now.toISO() }}
And the Timezone is: {{ $json.body.user_timezone }}

The Calendar tool expects the following format example but define the content based on the user request:

**CRITICAL REQUIREMENTS:**
1. **userId**: Use `{{ $json.body.user_id }}` from the incoming message
2. **timeZone**: Use `{{ $json.body.user_timezone }}` from the incoming message
3. **startDateTime** and **endDateTime**: Must be in ISO 8601 format with timezone offset
4. **DO NOT** use nested objects for start/end times - use flat fields
5. **DO NOT** send as an array - send as a single JSON object

**Example for a meeting tomorrow at 2pm:**
```json
{
  "userId": "{{ $json.body.user_id }}",
  "summary": "Team Meeting",
  "description": "Weekly team sync",
  "startDateTime": "2024-01-16T14:00:00-03:00",
  "endDateTime": "2024-01-16T15:00:00-03:00",
  "timeZone": "{{ $json.body.user_timezone }}",
  "attendees": []
}
````

**IMPORTANT:** The API expects flat fields (startDateTime, endDateTime) NOT nested objects (start.dateTime, end.dateTime). Always use the user's timezone from `{{ $json.body.user_timezone }}` for proper timezone handling.

Message: {{ $json.body.message }}

````

#### **Using Timezone in AI Agent Workflows**

Your AI agent can now access the user's timezone directly from the incoming message:

1. **Webhook Trigger** - Chat Message
   - Receives user message with timezone information

2. **AI Processing Node**
   - Use `{{ $json.body.user_timezone }}` to access the user's timezone
   - Provide timezone-aware responses and suggestions

3. **Calendar Event Creation**
   - Use the timezone when creating calendar events
   - Ensure events are scheduled in the user's local time

#### **Example: Timezone-Aware Meeting Scheduling**

When a user says "Schedule a meeting for tomorrow at 2pm", your AI agent can:

1. **Parse the request** using the user's timezone context
2. **Convert times** to the correct timezone for Google Calendar
3. **Create events** with proper timezone information
4. **Provide responses** in the user's local time

#### **Benefits for AI Agents:**

- **Context Awareness**: AI can understand the user's actual timezone
- **Better Scheduling**: AI can suggest times in the user's local timezone
- **Accurate Responses**: AI can provide timezone-aware responses
- **User Experience**: Events are created in the correct timezone automatically

## 📝 Example Webhook Data

### **Chat API Request:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Schedule a meeting for tomorrow at 2pm"
    }
  ],
  "chatId": "test-chat-123",
  "userId": "your-firebase-user-id"
}
````

### **Create Event Request:**

```json
{
  "userId": "your-firebase-user-id",
  "summary": "Team Meeting",
  "description": "Weekly team sync meeting",
  "startDateTime": "2024-01-15T10:00:00-07:00",
  "endDateTime": "2024-01-15T11:00:00-07:00",
  "timeZone": "America/Los_Angeles",
  "attendees": [
    { "email": "team@company.com" },
    { "email": "manager@company.com" }
  ]
}
```

### **Get Events Request:**

```
GET https://your-domain.com/api/calendar/events?userId=your-firebase-user-id&timeMin=2024-01-01T00:00:00Z&timeMax=2024-01-31T23:59:59Z
```

## 🔍 Testing Your Integration

### **1. Test Chat API with Timezone**

```bash
curl -X POST "https://your-domain.com/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Schedule a meeting for tomorrow at 2pm"
      }
    ],
    "chatId": "test-chat-123",
    "userId": "YOUR_USER_ID"
  }'
```

**Expected n8n webhook payload:**

```json
{
  "app_source": "alan-ai-webapp",
  "user_id": "YOUR_USER_ID",
  "chat_id": "test-chat-123",
  "conversation_id": "test-chat-123",
  "message": "Schedule a meeting for tomorrow at 2pm",
  "timestamp": "1703123456789",
  "message_id": "msg_1703123456789",
  "user_timezone": "America/Sao_Paulo"
}
```

### **2. Test Token Endpoint**

```bash
curl "https://your-domain.com/api/oauth/token?userId=YOUR_USER_ID"
```

### **3. Test Event Creation**

```bash
curl -X POST "https://your-domain.com/api/calendar/events" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "summary": "Test Meeting",
    "description": "Testing n8n integration",
    "startDateTime": "2024-01-15T10:00:00-07:00",
    "endDateTime": "2024-01-15T11:00:00-07:00",
    "timeZone": "America/Los_Angeles"
  }'
```

### **4. Test Calendar Settings**

```bash
curl "https://your-domain.com/api/calendar/settings?userId=YOUR_USER_ID"
```

### **5. Test n8n Webhook**

```bash
curl -X POST "https://your-n8n-instance.com/webhook/create-event" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "summary": "n8n Test Meeting",
    "description": "Testing n8n webhook",
    "startDateTime": "2024-01-15T14:00:00-07:00",
    "endDateTime": "2024-01-15T15:00:00-07:00",
    "timeZone": "America/Los_Angeles"
  }'
```

## 🛠️ Error Handling

### **Common Error Responses:**

1. **User Not Connected (401)**

   ```json
   {
     "error": "User not connected to Google Calendar"
   }
   ```

2. **Missing Fields (400)**

   ```json
   {
     "error": "Missing required fields: userId, summary, startDateTime, endDateTime"
   }
   ```

3. **Token Expired (500)**
   - Automatically handled by the API - tokens are refreshed automatically

## 🔐 Security Considerations

1. **User ID Validation**: Always validate the user ID in your n8n workflows
2. **HTTPS**: Use HTTPS for all API calls
3. **Rate Limiting**: Consider implementing rate limiting for production use
4. **Token Security**: Access tokens are automatically refreshed and managed securely

## 📊 Monitoring

### **Log Messages to Watch For:**

- `🌍 [Chat API] Fetching timezone for user:`
- `🌍 [Chat API] User's timezone:`
- `🔑 [Token API] Getting access token...`
- `✅ [Token API] Token refreshed successfully`
- `📅 [Calendar Events API] Creating calendar event...`
- `✅ [Calendar Events API] Event created successfully`
- `🔧 [Calendar Settings API] Getting calendar settings...`

### **Error Messages:**

- `❌ [Token API] No tokens found for user`
- `❌ [Calendar Events API] User not connected to Google Calendar`
- `⚠️ [Chat API] Could not fetch user timezone:`

## 🚀 Next Steps

1. **Set up your n8n workflows** using the examples above
2. **Test with your actual user ID** and domain
3. **Implement error handling** in your workflows
4. **Add additional features** like event updates, deletions, or recurring events

## 📞 Support

If you encounter any issues:

1. Check the browser console for detailed logs
2. Verify your Google Calendar connection in the app
3. Ensure your user ID is correct
4. Check that your domain is properly configured

---

**Happy automating! 🎉**
