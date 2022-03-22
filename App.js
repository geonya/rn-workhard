import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	TextInput,
	ScrollView,
} from "react-native";
import { theme } from "./color";

export default function App() {
	const [working, setWorking] = useState(true);
	const [text, setText] = useState("");
	const [toDos, setToDos] = useState({});
	const travle = () => setWorking(false);
	const work = () => setWorking(true);
	const onChangeText = (payload) => setText(payload);
	const addToDo = () => {
		if (text === "") {
			return;
		}
		const newToDos = { ...toDos, [Date.now()]: { text, working } };
		setToDos(newToDos);
		setText("");
	};

	return (
		<View style={styles.container}>
			<StatusBar style="auto" />
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
			<ScrollView>
				{Object.keys(toDos).map((key) =>
					toDos[key].working === working ? (
						<View style={styles.toDo} key={key}>
							<Text style={styles.toDoText}>
								{toDos[key].text}
							</Text>
						</View>
					) : null
				)}
			</ScrollView>
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
		backgroundColor: theme.toDoBg,
		marginBottom: 10,
		paddingVertical: 20,
		paddingHorizontal: 20,
		borderRadius: 15,
	},
	toDoText: { color: theme.white, fontSize: 16, fontWeight: "500" },
});