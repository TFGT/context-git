"use babel";
/** @jsx etch.dom */

import git from "../git-cmd";
import Dialog from "./Dialog";
import etch from "etch";

export default class DeleteBranchDialog extends Dialog {

	beforeInitialize() {
		this.fetch = this.fetch.bind(this);
		this.branchChange = this.branchChange.bind(this);
		this.forceChange = this.forceChange.bind(this);
	}

	initialState(props) {
		if (!props.root) {
			throw new Error("Must specify a {root} property");
		}

		let state = {
			branches: props.branches || [],
			branch: "",
			force: false,
			root: props.root,
			fetching: false,
		};

		state.branch = state.branches.reduce((prev, branch) => (branch.selected ? branch.name : prev), "");

		return state;
	}

	validate(state) {
		let error = false;
		if (!state.branch) {
			error = true;
			this.refs.branchInput.classList.add("error");
		}
		// TODO: confirm on force
		if (error) {
			return;
		}

		return [state.branch, state.force];
	}

	show() {
		this.refs.branchInput.focus();
	}

	async fetch() {
		this.update({ fetching: true });
		try {
			await git.fetch(this.state.root);
			const branches = await git.branches(this.state.root);
			this.update({ branches: branches, fetching: false });
		} catch (err) {
			atom.notifications.addError(err, { dismissable: true });
			this.update({ fetching: false });
		}
	}

	branchChange(e) {
		this.refs.branchInput.classList.remove("error");
		this.update({ branch: e.target.value });
	}

	forceChange(e) {
		this.update({ force: e.target.checked });
	}

	body() {
		let branchOptions;
		if (this.state.fetching) {
			branchOptions = (
				<option>Fetching...</option>
			);
		} else {
			branchOptions = this.state.branches.map(branch => (
				<option value={branch.name} selected={branch.name === this.state.branch}>{branch.path}</option>
			));
		}

		return (
			<div>
				<label className="input-label">
					<select ref="branchInput" tabIndex="1" className="native-key-bindings input-select" value={this.state.branch} disabled={this.state.fetching} onchange={this.branchChange}>
						{branchOptions}
					</select>
				</label>
				<label className="input-label">
					<input className="native-key-bindings input-checkbox" type="checkbox" tabIndex="2" checked={this.state.force} onchange={this.forceChange}/>
					Force
				</label>
			</div>
		);
	}

	title() {
		return "Delete Branch";
	}

	buttons() {
		return (
			<div>
				<button className="native-key-bindings btn icon icon-git-branch inline-block-tight" tabIndex="3" onclick={this.accept} disabled={this.state.fetching}>
					Delete Branch
				</button>
				<button className="native-key-bindings btn icon icon-repo-sync inline-block-tight" tabIndex="4" onclick={this.fetch} disabled={this.state.fetching}>
					Fetch
				</button>
			</div>
		);
	}
}