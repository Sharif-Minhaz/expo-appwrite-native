import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function App() {
	return (
		<View className="flex-1 bg-white items-center justify-center">
			<Text className="text-primary text-3xl">Rafi!</Text>
			<StatusBar style="auto" />
			<Link href="/profile" style={{ color: "blue" }}>
				Go to profile
			</Link>
		</View>
	);
}
