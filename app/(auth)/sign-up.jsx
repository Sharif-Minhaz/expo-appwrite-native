import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "react-native";
import { images } from "../../constants";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { useState } from "react";
import { Link, router } from "expo-router";
import { createUser, getCurrentUser } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";

const SignUp = () => {
	const { setUser, setIsLogged } = useGlobalContext();

	const [form, setForm] = useState({
		username: "",
		email: "",
		password: "",
	});

	const [isSubmitting, setIsSubmitting] = useState(false);

	const submit = async () => {
		if (form.username === "" || form.email === "" || form.password === "") {
			return Alert.alert("Error", "Please fill in all fields");
		}

		setIsSubmitting(true);

		try {
			const result = await createUser({
				username: form.username,
				password: form.password,
				email: form.email,
			});

			setUser(result);
			setIsLogged(true);

			router.replace("/home");
		} catch (error) {
			Alert.alert("Error", error.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<SafeAreaView className="bg-primary h-full">
			<ScrollView>
				<View className="w-full justify-center min-h-[85vh] px-4 my-6">
					<Image
						source={images.logo}
						resizeMode="contain"
						className="w-[115px] h-[35px]"
					/>
					<Text className="text-2xl font-semibold text-white mt-10 font-psemibold">
						Sign up to Aora
					</Text>
					<FormField
						title="Username"
						value={form.username}
						handleChangeText={(e) => setForm({ ...form, username: e })}
						otherStyles="mt-10"
					/>

					<FormField
						title="Email"
						value={form.email}
						handleChangeText={(e) => setForm({ ...form, email: e })}
						otherStyles="mt-7"
						keyboardType="email-address"
					/>

					<FormField
						title="Password"
						value={form.password}
						handleChangeText={(e) => setForm({ ...form, password: e })}
						otherStyles="mt-7"
					/>

					<CustomButton
						title="Sign Up"
						handlePress={submit}
						containerStyles="mt-7"
						isLoading={isSubmitting}
					/>

					<View className="flex justify-center pt-5 flex-row gap-2">
						<Text className="text-lg text-gray-100 font-pregular">
							Already have an account?
						</Text>
						<Link href="/sign-in" className="text-lg font-psemibold text-secondary">
							Signin
						</Link>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};
export default SignUp;
