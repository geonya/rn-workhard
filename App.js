import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	TextInput,
	ScrollView,
	ActivityIndicator,
	Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./color";
import { Feather } from "@expo/vector-icons";

const STORAGE_KEY = "@toDos";

export default function App() {
	const [working, setWorking] = useState(true);
	const [text, setText] = useState("");
	const [toDos, setToDos] = useState({});
	const travle = () => setWorking(false);
	const work = () => setWorking(true);
	const onChangeText = (payload) => setText(payload);
	const saveToDos = async (toSave) => {
		try {
			await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
		} catch (e) {
			console.log(e);
			Alert.alert(e);
		}
	};
	const loadToDos = async () => {
		try {
			const s = await AsyncStorage.getItem(STORAGE_KEY);
			setToDos(JSON.parse(s));
		} catch (e) {
			console.log(e);
			Alert.alert(e);
		}
	};
	useEffect(() => {
		loadToDos();
	}, []);
	const addToDo = async () => {
		if (text === "") {
			return;
		}
		const newToDos = { ...toDos, [Date.now()]: { text, working } };
		setToDos(newToDos);
		await saveToDos(newToDos);
		setText("");
	};
	const deleteToDo = async (id) => {
		Alert.alert("Delete To Do?", "Are you sure?", [
			{ text: "Cancel" },
			{
				text: "I'm sure",
				style: "destructive",
				onPress: async () => {
					const newToDos = { ...toDos };
					delete newToDos[id]; // state 에 저장하기 전에 mutate 한다.
					setToDos(newToDos);
					await saveToDos(newToDos);
				},
			},
		]);
	};
	return (
		<View style={styles.container}>
			<StatusBar style="light" />
			<View style={styles.header}>
				<TouchableOpacity onPress={work}>
					<Text
						style={{
							...styles.btnText,
							color: working ? theme.white : theme.grey,
						}}
					>
						Work
					</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={travle}>
					<Text
						style={{
							...styles.btnText,
							color: working ? theme.grey : theme.white,
						}}
					>
						Travle
					</Text>
				</TouchableOpacity>
			</View>
			<TextInput
				onSubmitEditing={addToDo}
				onChangeText={onChangeText}
				style={styles.input}
				value={text}
				placeholder={
					working ? "Add a To Do" : "Where Do you wanna Go ?"
				}
				keyboardAppearance="dark"
				returnKeyType="done"
			/>
			{toDos === {} ? (
				<View style={styles.loadingView}>
					<ActivityIndicator
						color={theme.white}
						style={styles.loadingCircle}
						size="large"
					/>
				</View>
			) : (
				<ScrollView>
					{Object.keys(toDos).map((key) =>
						toDos[key].working === working ? (
							<View style={styles.toDo} key={key}>
								<Text style={styles.toDoText}>
									{toDos[key].text}
								</Text>
								<TouchableOpacity
									onPress={() => deleteToDo(key)}
								>
									<Feather
										name="trash-2"
										size={24}
										color={theme.grey}
									/>
								</TouchableOpacity>
							</View>
						) : null
					)}
				</ScrollView>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.bg,
		paddingHorizontal: 20,
	},
	header: {
		justifyContent: "space-between",
		flexDirection: "row",
		marginTop: 100,
	},
	btnText: {
		fontSize: 38,
		fontWeight: "600",
		color: theme.white,
	},
	input: {
		backgroundColor: theme.white,
		paddingVertical: 15,
		paddingHorizontal: 20,
		marginVertical: 20,
		borderRadius: 30,
		marginTop: 20,
		fontSize: 18,
	},
	toDo: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: theme.toDoBg,
		marginBottom: 10,
		paddingVertical: 20,
		paddingHorizontal: 20,
		borderRadius: 15,
	},
	toDoText: { color: theme.white, fontSize: 16, fontWeight: "500" },
	loadingView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingCircle: { marginTop: -150 },
});
