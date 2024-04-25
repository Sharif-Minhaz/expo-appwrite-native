import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";
import { appwriteConfig } from "../config/appwriteConfig";

// Init your react-native SDK
const client = new Client();

client
	.setEndpoint(appwriteConfig.endpoint) // Your Appwrite Endpoint
	.setProject(appwriteConfig.projectId) // Your project ID
	.setPlatform(appwriteConfig.platform); // Your application ID or bundle ID.

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const createUser = async ({ email, password, username }) => {
	try {
		const newAccount = await account.create(ID.unique(), email, password, username);

		if (!newAccount) throw Error;

		const avatarUrl = avatars.getInitials(username);

		await signIn(email, password); // sign in too

		const newUser = await databases.createDocument(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			ID.unique(),
			{
				accountId: newAccount.$id,
				email: email,
				username: username,
				avatar: avatarUrl,
			}
		);

		return newUser;
	} catch (error) {
		throw new Error(error);
	}
};

// Sign In
export async function signIn(email, password) {
	try {
		const session = await account.createEmailSession(email, password);

		return session;
	} catch (error) {
		throw new Error(error);
	}
}

// Get Account
export async function getAccount() {
	try {
		const currentAccount = await account.get();

		return currentAccount;
	} catch (error) {
		throw new Error(error);
	}
}

// Get Current User
export async function getCurrentUser() {
	try {
		const currentAccount = await getAccount();
		if (!currentAccount) throw Error;

		const currentUser = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			[Query.equal("accountId", currentAccount.$id)]
		);

		if (!currentUser) throw Error;

		return currentUser.documents[0];
	} catch (error) {
		console.log(error);
		return null;
	}
}

// Sign Out
export async function signOut() {
	try {
		const session = await account.deleteSession("current");

		return session;
	} catch (error) {
		throw new Error(error);
	}
}

// Get all video Posts
export async function getAllPosts() {
	try {
		const posts = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.videosCollectionId,
			[Query.orderDesc("$createdAt")]
		);

		return posts.documents;
	} catch (error) {
		throw new Error(error);
	}
}

// Get video posts created by user
export async function getUserPosts(userId) {
	try {
		const posts = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.videosCollectionId,
			[Query.equal("creator", userId)]
		);

		return posts.documents;
	} catch (error) {
		throw new Error(error);
	}
}

// Get video posts that matches search query
export async function searchPosts(query) {
	try {
		const posts = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.videosCollectionId,
			[Query.search("title", query)]
		);

		if (!posts) throw new Error("Something went wrong");

		return posts.documents;
	} catch (error) {
		throw new Error(error);
	}
}

// Get latest created video posts
export async function getLatestPosts() {
	try {
		const posts = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.videosCollectionId,
			[Query.orderDesc("$createdAt"), Query.limit(7)]
		);

		return posts.documents;
	} catch (error) {
		throw new Error(error);
	}
}

// Upload File
export async function uploadFile(file, type) {
	if (!file) return;

	const asset = {
		name: file.fileName,
		type: file.mimeType,
		size: file.filesize,
		uri: file.uri,
	};

	try {
		const uploadedFile = await storage.createFile(appwriteConfig.bucketId, ID.unique(), asset);
		console.log(uploadedFile);
		const fileUrl = await getFilePreview(uploadedFile.$id, type);
		return fileUrl;
	} catch (error) {
		throw new Error(error);
	}
}

// Get File Preview
export async function getFilePreview(fileId, type) {
	let fileUrl;

	try {
		if (type === "video") {
			fileUrl = storage.getFileView(appwriteConfig.bucketId, fileId);
		} else if (type === "image") {
			fileUrl = storage.getFilePreview(
				appwriteConfig.bucketId,
				fileId,
				2000,
				2000,
				"top",
				100
			);
		} else {
			throw new Error("Invalid file type");
		}

		if (!fileUrl) throw Error;

		return fileUrl;
	} catch (error) {
		throw new Error(error);
	}
}

// Create Video Post
export async function createVideoPost(form) {
	try {
		const [thumbnailUrl, videoUrl] = await Promise.all([
			uploadFile(form.thumbnail, "image"),
			uploadFile(form.video, "video"),
		]);

		const newPost = await databases.createDocument(
			appwriteConfig.databaseId,
			appwriteConfig.videosCollectionId,
			ID.unique(),
			{
				title: form.title,
				thumbnail: thumbnailUrl,
				video: videoUrl,
				prompt: form.prompt,
				creator: form.userId,
			}
		);

		return newPost;
	} catch (error) {
		throw new Error(error);
	}
}
