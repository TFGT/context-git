"use babel";
/** @jsx etch.dom */

import Dialog from "./Dialog";
import etch from "etch";

export default class CommitDialog extends Dialog {

	beforeInitialize() {
		this.messageChange = this.messageChange.bind(this);
		this.amendChange = this.amendChange.bind(this);
		this.signChange = this.signChange.bind(this);
		this.pushClick = this.pushClick.bind(this);
		this.syncClick = this.syncClick.bind(this);
		this.fileChange = this.fileChange.bind(this);
	}

	initialState(props) {
		let state = {
			files: props.files || [],
			message: "",
			lastCommit: props.lastCommit || "",
			amend: false,
			sign: false,
			push: false,
			sync: false,
		};
		state.files = state.files.map(file => {
			file.selected = true;
			return file;
		});
		return state;
	}

	validate(state) {
		let error = false;
		if (!state.message) {
			error = true;
			this.refs.messageInput.classList.add("error");
		}
		if (error) {
			return;
		}

		const files = state.files.filter(file => file.selected)
			.map(file => file.file);

		return [
			state.message,
			state.amend,
			state.sign,
			state.push,
			state.sync,
			files,
		];
	}

	show() {
		this.refs.messageInput.focus();
	}

	messageChange(e) {
		this.refs.messageInput.classList.remove("error");
		this.update({ message: e.target.value });
	}

	amendChange(e) {
		let message = this.state.message;
		const amend = e.target.checked;
		if (!message && amend) {
			message = this.state.lastCommit;
		} else if (message === this.state.lastCommit && !amend) {
			message = "";
		}
		this.update({ message, amend });
	}

	signChange(e) {
		const sign = e.target.checked;
		this.update({ sign });
	}

	pushClick(e) {
		this.update({ push: true });
		this.accept();
	}

	syncClick(e) {
		this.update({ push: true, sync: true, });
		this.accept();
	}

	fileChange(idx) {
		return (e) => {
			const files = this.state.files.map((file, i) => {
				if (idx === i) {
					file.selected = e.target.checked;
				}
				return file;
			});
			this.update({ files });
		};
	}

	body() {

		const files = this.state.files.map((file, idx) => {
			let classes = ["file"];
			if (file.added) {
				classes.push("added");
			}
			if (file.untracked) {
				classes.push("untracked");
			}
			if (file.deleted) {
				classes.push("deleted");
			}
			if (file.changed) {
				classes.push("changed");
			}
			return (
				<div className={classes.join(" ")}>
					<label className="input-label">
						<input className="native-key-bindings input-checkbox" type="checkbox" tabIndex={idx + 1} checked={file.selected} onchange={this.fileChange(idx)}/>
						{file.file}
					</label>
				</div>
			);
		});

		const messageTooLong = this.state.message.split("\n")
			.some((line, idx) => ((idx === 0 && line.length > 50) || line.length > 80));
		const lastCommitLines = this.state.lastCommit !== null ? this.state.lastCommit.split("\n") : null;
		const firstLineOfLastCommit = lastCommitLines !== null ? lastCommitLines[0] + (lastCommitLines.length > 1 ? "..." : "") : null;

		return (
			<div>
				<div className="files" ref="files">
					{files}
				</div>
				<textarea ref="messageInput" placeholder="Commit Message" tabIndex={this.state.files.length + 1} className={(messageTooLong ? "too-long " : "") + "input-textarea message native-key-bindings"} oninput={this.messageChange} value={this.state.message}/>
				<label className="input-label checkbox-label">
					<input className="native-key-bindings input-checkbox" type="checkbox" tabIndex={this.state.files.length + 2} checked={this.state.amend} onchange={this.amendChange} disabled={this.state.lastCommit === null} />
					Amend Last Commit: <span className="last-commit">{firstLineOfLastCommit !== null ? firstLineOfLastCommit : ""}</span>
				</label>
				<label className="input-label checkbox-label">
					<input className="native-key-bindings input-checkbox" type="checkbox" tabIndex={this.state.files.length + 3} checked={this.state.sign} onchange={this.signChange} />
					Sign Commit
				</label>
			</div>
		);
	}

	title() {
		return "Commit";
	}

	buttons() {
		return (
			<div>
				<button className="native-key-bindings btn icon icon-git-commit inline-block-tight" tabIndex={this.state.files.length + 3} onclick={this.accept}>
					Commit
				</button>
				<button className="native-key-bindings btn icon icon-repo-push inline-block-tight" tabIndex={this.state.files.length + 4} onclick={this.pushClick}>
					Commit & Push
				</button>
				<button className="native-key-bindings btn icon icon-sync inline-block-tight" tabIndex={this.state.files.length + 5} onclick={this.syncClick}>
					Commit & Sync
				</button>
			</div>
		);
	}
}
