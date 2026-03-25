import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PaymentNotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # We expect user_id in the url route, e.g., ws/notifications/<user_id>/
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f'user_{self.user_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from room group
    async def payment_notification(self, event):
        message = event['message']
        amount = event['amount']

        # Send message to WebSocket frontend
        await self.send(text_data=json.dumps({
            'type': 'payment_notification',
            'message': message,
            'amount': amount
        }))
