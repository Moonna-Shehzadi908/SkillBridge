from django.urls import path

from .views import (
    ChatConversationListCreateView,
    ChatConversationDetailView,
    ChatMessageCreateView,
)

urlpatterns = [
    path(
        "",
        ChatConversationListCreateView.as_view(),
        name="chat-conversation-list-create",
    ),
    path(
        "<int:pk>/",
        ChatConversationDetailView.as_view(),
        name="chat-conversation-detail",
    ),
    path(
        "<int:conversation_id>/messages/",
        ChatMessageCreateView.as_view(),
        name="chat-message-create",
    ),
]