import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api/chats",
    withCredentials: true,
});

export const sendMessage = async (chatId, message) => {
    try {
        const response = await api.post(`/${chatId}/messages`, { message });
        return response.data;
    } catch (error) {
        console.error("Error sending message:", error);
        return { error: "Failed to send message" };
    }
};

export const getChats = async () => {
    try {
        const response = await api.get("/");
        return response.data;
    } catch (error) {
        console.error("Error fetching chats:", error);
        return { error: "Failed to fetch chats" };
    }
};

export const getMessages = async (chatId) => {
    try {
        const response = await api.get(`/${chatId}/messages`);
        return response.data;
    } catch (error) {
        console.error("Error fetching messages:", error);
        return { error: "Failed to fetch messages" };
    }
};  

export const deleteChat = async (chatId) => {
    try {
        const response = await api.delete(`/${chatId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting chat:", error);
        return { error: "Failed to delete chat" };
    }
};
