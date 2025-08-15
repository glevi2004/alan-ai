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
  "attendees": [
    {"email": "team@company.com"}
  ]
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

### 3. **Calendar Events Endpoint** - Get Events
```
GET https://your-domain.com/api/calendar/events?userId=YOUR_USER_ID&timeMin=2024-01-01T00:00:00Z&timeMax=2024-01-31T23:59:59Z
```

## 🔧 n8n Workflow Setup

### **Workflow 1: Create Calendar Event (Simple)**

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
    {"email": "team@company.com"},
    {"email": "manager@company.com"}
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

## 📞 Support

If you encounter any issues:
1. Check the browser console for detailed logs
2. Verify your Google Calendar connection in the app
3. Ensure your user ID is correct
4. Check that your domain is properly configured

---

**Happy automating! 🎉**
