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
import * as Progress from "react-native-progress";

const STORAGE_TODO_KEY = "@toDos";
const STORAGE_TAB_KEY = "@tab";

export default function App() {
	const [working, setWorking] = useState(true);
	const [text, setText] = useState("");
	const [toDos, setToDos] = useState({});
	const [progress, setProgress] = useState();
	const keyArray = Object.keys(toDos);
	const travel = async () => {
		setWorking(false);
		await saveTab(false);
	};
	const work = async () => {
		setWorking(true);
		await saveTab(true);
	};
	const onChangeText = (payload) => setText(payload);
	const saveToDos = async (toSave) => {
		try {
			await AsyncStorage.setItem(
				STORAGE_TODO_KEY,
				JSON.stringify(toSave)
			);
		} catch (e) {
			console.log(e);
			Alert.alert(e);
		}
	};
	const saveTab = async (tab) => {
		try {
			await AsyncStorage.setItem(STORAGE_TAB_KEY, JSON.stringify(tab));
		} catch (e) {
			console.log(e);
			Alert.alert(e);
		}
	};
	const loadToDos = async () => {
		try {
			const tab = await AsyncStorage.getItem(STORAGE_TODO_KEY);
			setToDos(JSON.parse(tab));
		} catch (e) {
			console.log(e);
			Alert.alert(e);
		}
	};
	const loadTab = async () => {
		try {
			const t = await AsyncStorage.getItem(STORAGE_TAB_KEY);
			setWorking(JSON.parse(t));
		} catch (e) {
			console.log(e);
			Alert.alert(e);
		}
	};

	const addToDo = async () => {
		if (text === "") {
			return;
		}
		const newToDos = {
			[Date.now()]: { text, working, done: false },
			...toDos,
		};
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
	const doneToDo = async (id) => {
		const toDo = toDos[id];
		const newToDo = toDo.done
			? { ...toDo, done: false }
			: { ...toDo, done: true };
		const newToDos = { ...toDos, [id]: newToDo };
		setToDos(newToDos);
		await saveToDos(newToDos);
	};
	const changeToDo = async (id, text) => {
		const toDo = toDos[id];
		const newToDo = toDo.done ? { ...toDo, text } : { ...toDo, text };
		const newToDos = { ...toDos, [id]: newToDo };
		setToDos(newToDos);
		await saveToDos(newToDos);
	};
	useEffect(() => {
		loadToDos();
		loadTab();
	}, []);
	useEffect(() => {
		if (working) {
			const totalToDos = keyArray.filter(
				(key) => toDos[key].working
			).length;
			const totalDone = keyArray.filter(
				(key) => toDos[key].working && toDos[key].done
			).length;
			setProgress(totalToDos === 0 ? 0 : totalDone / totalToDos);
		} else {
			const totalToDos = keyArray.filter(
				(key) => !toDos[key].working
			).length;
			const totalDone = keyArray.filter(
				(key) => !toDos[key].working && toDos[key].done
			).length;
			setProgress(totalToDos === 0 ? 0 : totalDone / totalToDos);
		}
	}, [working, toDos]);
	return (
		<View style={styles.container}>
			<StatusBar style="light" />
			<View style={styles.header}>
				<Progress.Bar
					style={{ marginBottom: 20 }}
					color={theme.white}
					progress={progress}
					width={null}
					animationType="spring"
					borderWidth={0}
				/>
				<View
					style={{
						flexDirection: "row",
						justifyContent: "space-between",
					}}
				>
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
					<TouchableOpacity onPress={travel}>
						<Text
							style={{
								...styles.btnText,
								color: working ? theme.grey : theme.white,
							}}
						>
							Travel
						</Text>
					</TouchableOpacity>
				</View>
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
			{toDos === {} ? ( // if toDos empty loading {} ? null ?
				<View style={styles.loadingView}>
					<ActivityIndicator
						color={theme.white}
						style={styles.loadingCircle}
						size="large"
					/>
				</View>
			) : (
				<ScrollView>
					{keyArray.map(
						(
							key // Object.keys 는 hashmap의 key 만 모아 배열로 반환해준다.
						) =>
							toDos[key].working === working ? ( // Work / Travle 탭을 true/false 로 구분
								<View style={styles.toDo} key={key}>
									<TouchableOpacity
										style={{ padding: 1 }}
										onPress={() => doneToDo(key)}
									>
										{toDos[key].done ? (
											<Feather
												name="check-square"
												size={25}
												color={theme.grey}
											/>
										) : (
											<Feather
												name="square"
												size={25}
												color={theme.white}
											/>
										)}
									</TouchableOpacity>
									<TextInput
										style={{
											...styles.editToDo,
											textDecorationLine: toDos[key].done
												? "line-through"
												: "none",
											color: toDos[key].done
												? theme.grey
												: theme.white,
										}}
										editable={
											toDos[key].done ? false : true
										}
										onChangeText={(
											text = toDos[key].text
										) => {
											if (!toDos[key].done)
												changeToDo(key, text);
										}}
										value={toDos[key].text}
										keyboardAppearance="dark"
										returnKeyType="done"
										placeholder="   "
									/>
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
		paddingVertical: 12,
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
	editToDo: {
		color: theme.white,
		fontSize: 16,
	},
});
