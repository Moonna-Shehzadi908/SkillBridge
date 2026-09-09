from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ChatConversation, ChatMessage
from .serializers import (
    ChatConversationSerializer,
    ChatMessageSerializer,
)
from .services import generate_chatbot_response


class ChatConversationListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = ChatConversation.objects.filter(
            user=request.user
        )
        serializer = ChatConversationSerializer(
            conversations,
            many=True,
        )
        return Response(serializer.data)

    def post(self, request):
        title = request.data.get(
            "title",
            "SkillBridge Assistant",
        )

        conversation = ChatConversation.objects.create(
            user=request.user,
            title=title,
        )

        serializer = ChatConversationSerializer(conversation)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )


class ChatConversationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        try:
            return ChatConversation.objects.get(
                id=pk,
                user=request.user,
            )
        except ChatConversation.DoesNotExist:
            return None

    def get(self, request, pk):
        conversation = self.get_object(request, pk)

        if not conversation:
            return Response(
                {"detail": "Conversation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ChatConversationSerializer(conversation)
        return Response(serializer.data)

    def delete(self, request, pk):
        conversation = self.get_object(request, pk)

        if not conversation:
            return Response(
                {"detail": "Conversation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        conversation.delete()

        return Response(
            {"detail": "Conversation deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


class ChatMessageCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):
        message = request.data.get("message", "").strip()

        if not message:
            return Response(
                {"detail": "Message cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            conversation = ChatConversation.objects.get(
                id=conversation_id,
                user=request.user,
            )
        except ChatConversation.DoesNotExist:
            return Response(
                {"detail": "Conversation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        user_message = ChatMessage.objects.create(
            conversation=conversation,
            sender=ChatMessage.Sender.USER,
            message=message,
        )

        assistant_response = generate_chatbot_response(
            request.user,
            message,
        )

        assistant_message = ChatMessage.objects.create(
            conversation=conversation,
            sender=ChatMessage.Sender.ASSISTANT,
            message=assistant_response,
        )

        return Response(
            {
                "user_message": ChatMessageSerializer(
                    user_message
                ).data,
                "assistant_message": ChatMessageSerializer(
                    assistant_message
                ).data,
            },
            status=status.HTTP_201_CREATED,
        )