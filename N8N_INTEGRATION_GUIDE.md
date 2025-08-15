# 🚀 n8n Integration Guide for Google Calendar

This guide will help you set up n8n workflows to integrate with your Google Calendar through the provided API endpoints.

## 📋 Prerequisites

1. **Google Calendar Connected**: Ensure you've connected your Google Calendar in the app first
2. **User ID**: You'll need your Firebase user ID (found in the browser console or app logs)
3. **n8n Instance**: A running n8n instance (cloud or self-hosted)

## 🔗 Available API Endpoints

### 1. **Token Endpoint** - Get Access Token

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

### 2. **Calendar Events Endpoint** - Create Events

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

### 3. **Calendar Settings Endpoint** - Get User's Calendar Settings

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

### 4. **Calendar Events Endpoint** - Get Events

```
GET https://your-domain.com/api/calendar/events?userId=YOUR_USER_ID&timeMin=2024-01-01T00:00:00Z&timeMax=2024-01-31T23:59:59Z
```

## 🔧 n8n Workflow Setup

### **Workflow 1: Create Calendar Event with User Timezone**

This workflow fetches the user's timezone and uses it for event creation:

1. **Webhook Trigger**

   - **Method**: `POST`
   - **Path**: `/create-event-with-timezone`

2. **HTTP Request Node** - Get User's Timezone

   - **Method**: `GET`
   - **URL**: `https://your-domain.com/api/calendar/settings?userId={{$json.userId}}`
   - **Authentication**: `None`

3. **HTTP Request Node** - Create Event

   - **Method**: `POST`
   - **URL**: `https://your-domain.com/api/calendar/events`
   - **Authentication**: `None`
   - **Content-Type**: `application/json`
   - **Body**:

   ```json
   {
     "userId": "{{$json.userId}}",
     "summary": "{{$json.summary}}",
     "description": "{{$json.description}}",
     "startDateTime": "{{$json.startDateTime}}",
     "endDateTime": "{{$json.endDateTime}}",
     "timeZone": "{{$node['Get User Timezone'].json.settings.timeZone}}",
     "attendees": {{$json.attendees}}
   }
   ```

4. **Response Node**
   - Return the event creation result with user's timezone

### **Workflow 2: Create Calendar Event (Simple)**

1. **Webhook Trigger**

   - **Method**: `POST`
   - **Path**: `/create-event`

2. **HTTP Request Node** - Create Event

   - **Method**: `POST`
   - **URL**: `https://your-domain.com/api/calendar/events`
   - **Authentication**: `None`
   - **Content-Type**: `application/json`
   - **Body**:

   ```json
   {
     "userId": "{{$json.userId}}",
     "summary": "{{$json.summary}}",
     "description": "{{$json.description}}",
     "startDateTime": "{{$json.startDateTime}}",
     "endDateTime": "{{$json.endDateTime}}",
     "timeZone": "{{$json.timeZone}}",
     "attendees": {{$json.attendees}}
   }
   ```

3. **Response Node**
   - Return the event creation result

### **Workflow 2: Create Calendar Event (Advanced with Token Refresh)**

1. **Webhook Trigger**

   - **Method**: `POST`
   - **Path**: `/create-event-advanced`

2. **HTTP Request Node** - Get Access Token

   - **Method**: `GET`
   - **URL**: `https://your-domain.com/api/oauth/token?userId={{$json.userId}}`
   - **Authentication**: `None`

3. **HTTP Request Node** - Create Event via Google API

   - **Method**: `POST`
   - **URL**: `https://www.googleapis.com/calendar/v3/calendars/primary/events`
   - **Authentication**: `Header Auth`
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer {{$json.access_token}}`
   - **Content-Type**: `application/json`
   - **Body**:

   ```json
   {
     "summary": "{{$json.summary}}",
     "description": "{{$json.description}}",
     "start": {
       "dateTime": "{{$json.startDateTime}}",
       "timeZone": "{{$json.timeZone}}"
     },
     "end": {
       "dateTime": "{{$json.endDateTime}}",
       "timeZone": "{{$json.timeZone}}"
     },
     "attendees": {{$json.attendees}},
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

## 📝 Example Webhook Data

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

### **1. Test Token Endpoint**

```bash
curl "https://your-domain.com/api/oauth/token?userId=YOUR_USER_ID"
```

### **2. Test Event Creation**

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

### **3. Test n8n Webhook**

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

### **4. Test Chat API with Timezone**

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

- `🔑 [Token API] Getting access token...`
- `✅ [Token API] Token refreshed successfully`
- `📅 [Calendar Events API] Creating calendar event...`
- `✅ [Calendar Events API] Event created successfully`

### **Error Messages:**

- `❌ [Token API] No tokens found for user`
- `❌ [Calendar Events API] User not connected to Google Calendar`

## 🚀 Next Steps

1. **Set up your n8n workflows** using the examples above
2. **Test with your actual user ID** and domain
3. **Implement error handling** in your workflows
4. **Add additional features** like event updates, deletions, or recurring events

## 🤖 AI Agent Integration

### **User Timezone in Chat Messages**

The user's timezone is now automatically included in every chat message sent to n8n, allowing your AI agent to provide timezone-aware responses:

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

#### **Using Timezone in AI Agent Workflows**

Your AI agent can now access the user's timezone directly from the incoming message:

1. **Webhook Trigger** - Chat Message

   - Receives user message with timezone information

2. **AI Processing Node**

   - Use `{{$json.user_timezone}}` to access the user's timezone
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

### **Using User Timezone with Calendar Events**

When creating events through n8n workflows, you can now pass the user's timezone to your AI agent for better context:

#### **Example: AI Agent Workflow**

1. **Webhook Trigger** - Chat Message

   - Receives user message with timezone information

2. **AI Processing Node**

   - Parse user request using `{{$json.user_timezone}}` for context
   - Generate timezone-aware response

3. **HTTP Request Node** - Create Event (if needed)

   - Use timezone from `{{$json.user_timezone}}` for event creation

4. **Response to User**
   - Provide timezone-aware response in user's local time

#### **Benefits for AI Agents:**

- **Context Awareness**: AI can understand the user's actual timezone
- **Better Scheduling**: AI can suggest times in the user's local timezone
- **Accurate Responses**: AI can provide timezone-aware responses
- **User Experience**: Events are created in the correct timezone automatically

## 📞 Support

If you encounter any issues:

1. Check the browser console for detailed logs
2. Verify your Google Calendar connection in the app
3. Ensure your user ID is correct
4. Check that your domain is properly configured

---

**Happy automating! 🎉**
