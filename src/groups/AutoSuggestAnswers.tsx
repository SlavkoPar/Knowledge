import React, { type JSX } from 'react';
import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from "autosuggest-highlight/match";
import AutosuggestHighlightParse from "autosuggest-highlight/parse";

import { isMobile } from 'react-device-detect'

import { debounce, escapeRegexCharacters } from '@/common/utilities'
import './AutoSuggestAnswers.css'
import { type IGroupRow, type IAnswerKey, type IAnswerRow, AnswerKey } from '@/groups/types';


interface IGrpMy {
	id: string,
	parentGroupUp: string,
	groupParentTitle: string,
	groupTitle: string,
	answerRows: IAnswerRow[]
}

interface IGrpSection {
	id: string | null,
	groupTitle: string,
	parentGroupUp: string,
	groupParentTitle: string, // TODO ???
	answerRows: IAnswerRow[]
}

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expression
// s#Using_Special_Characters
// function escapeRegexCharacters(str: string): string {
// 	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// }

// autoFocus does the job
//let inputAutosuggest = createRef<HTMLInputElement>();
// interface IGrpIdTitle {
// 	id: string;
// 	title: string;
// }

const AnswerAutosuggestMulti = Autosuggest as { new(): Autosuggest<IAnswerRow, IGrpMy> };

export class AutoSuggestAnswers extends React.Component<{
	tekst: string | undefined,
	onSelectAnswer: (answerKey: IAnswerKey, underFilter: string) => void,
	allGroupRows: Map<string, IGroupRow>,
	searchAnswers: (filter: string, count: number) => Promise<IAnswerRow[]>
}, any> {
	// region Fields
	state: any;
	isMob: boolean;
	allGroupRows: Map<string, IGroupRow>;
	searchAnswers: (filter: string, count: number) => Promise<IAnswerRow[]>;
	debouncedLoadSuggestions: (value: string) => void;
	//inputAutosuggest: React.RefObject<HTMLInputElement>;
	// endregion region Constructor
	constructor(props: any) {
		console.log("AutoSuggestAnswers CONSTRUCTOR")
		super(props);
		this.state = {
			value: props.tekst || '',
			suggestions: [], //this.getSuggestions(''),
			noSuggestions: false,
			highlighted: ''
		};
		//this.inputAutosuggest = createRef<HTMLInputElement>();
		this.allGroupRows = props.allGroupRows;
		this.searchAnswers = props.searchAnswers;
		this.isMob = isMobile;
		this.loadSuggestions = this.loadSuggestions.bind(this);
		this.debouncedLoadSuggestions = debounce(this.loadSuggestions, 300);
	}


	async loadSuggestions(value: string) {
		this.setState({
			isLoading: true
		});

		console.time();
		const suggestions = await this.getSuggestions(value);
		console.timeEnd();

		if (value === this.state.value) {
			this.setState({
				isLoading: false,
				suggestions,
				noSuggestions: suggestions.length === 0
			});
		}
		else { // Ignore suggestions if input value changed
			this.setState({
				isLoading: false
			});
		}
	}

	componentDidMount() {
		setTimeout(() => {
			window.focus()
			// inputAutosuggest!.current!.focus();
		}, 300)
	}

	// endregion region Rendering methods
	render(): JSX.Element {
		const { value, suggestions, noSuggestions } = this.state;

		return <div>
			<AnswerAutosuggestMulti
				onSuggestionsClearRequested={this.onSuggestionsClearRequested}  // (sl) added
				multiSection={true}
				suggestions={suggestions}
				onSuggestionsFetchRequested={this.onSuggestionsFetchRequested.bind(this)}
				onSuggestionSelected={this.onSuggestionSelected.bind(this)}
				getSuggestionValue={this.getSuggestionValue}
				renderSuggestion={this.renderSuggestion}
				renderSectionTitle={this.renderSectionTitle}
				getSectionSuggestions={this.getSectionSuggestions}
				// onSuggestionHighlighted={this.onSuggestionHighlighted} (sl)
				onSuggestionHighlighted={this.onSuggestionHighlighted.bind(this)}
				highlightFirstSuggestion={false}
				renderInputComponent={this.renderInputComponent}
				// renderSuggestionsContainer={this.renderSuggestionsContainer}
				focusInputOnSuggestionClick={!this.isMob}
				inputProps={{
					placeholder: `Type 'remote'`,
					value,
					onChange: (e, changeEvent) => this.onChange(e, changeEvent),
					autoFocus: true
				}}
			/>
			{noSuggestions &&
				<div className="no-suggestions">
					No answers to suggest
				</div>
			}
		</div>
	}


	// private satisfyingGroups = (searchWords: string[]): IGrpIdTitle[] => {
	// 	const arr: IGrpIdTitle[] = [];
	// 	searchWords.filter(w => w.length >= 3).forEach(w => {
	// 		this.allGroupRows.forEach(async Grp => {
	// 			//const parentId = Grp.id;
	// 			//let j = 0;
	// 			// Grp.words.forEach(Grpw => {
	// 			// 	if (Grpw.includes(w)) {
	// 			// 		console.log("Add all answers of group")
	// 			// 		arr.push({ id: Grp.id, title: Grp.title })
	// 			// 	}
	// 			// })
	// 		})
	// 	})
	// 	return arr;
	// }

	protected async getSuggestions(search: string): Promise<IGrpSection[]> {
		const escapedValue = escapeRegexCharacters(search.trim());
		if (escapedValue === '') {
			return [];
		}
		if (search.length < 3)
			return [];
		const GrpSection = new Map<string | null, IAnswerRow[]>();
		const answerKeys: IAnswerKey[] = [];
		try {
			console.log('--------->>>>> getSuggestions')
			var answerRows: IAnswerRow[] = await this.searchAnswers(escapedValue, 10);
			answerRows.forEach((answerRow: IAnswerRow) => {
				const { topId, parentId, id, title, included } = answerRow;
				const answerKey = new AnswerKey(answerRow).answerKey!;
				if (!answerKeys.includes(answerKey)) {
					answerKeys.push(answerKey);

					// 2) Group answers by parentId
					const row: IAnswerRow = {
						topId,
						parentId,
						id,
						title,
						groupTitle: '',
						included
					}
					if (!GrpSection.has(parentId)) {
						GrpSection.set(parentId, [row]);
					}
					else {
						GrpSection.get(parentId)!.push(row);
					}
				}
			})
		}
		catch (error: any) {
			console.debug(error)
		};

		////////////////////////////////////////////////////////////////////////////////
		// Search for Groups title words, and add all the answers of the Group
		/*
		if (answerKeys.length === 0) {
			try {
				const tx = this.dbp!.transaction('Answers')
				const index = tx.store.index('parentGroup_idx');
				const GrpIdTitles = this.satisfyingGroups(searchWords)
				let i = 0;
				while (i < GrpIdTitles.length) {
					const GrpIdTitle = GrpIdTitles[i];
					const parentId = GrpIdTitle.id;
					for await (const cursor of index.iterate(parentId)) {
						const q: IAnswer = cursor.value;
						const { id, title } = q;
						//if (!answerRows.includes(id!))
						//	answerRows.push(id!);

						const answerKey = { parentId, id }
						if (!answerKeys.includes(answerKey)) {
							answerKeys.push(answerKey);

							//console.log(q);
							// 2) Group answers by parentId
							const quest: IAnswerRow = {
								id,
								parentId,
								title,
								groupTitle: GrpIdTitle.title
							}
							if (!GrpQuests.has(parentId)) {
								GrpQuests.set(parentId, [quest]);
							}
							else {
								GrpQuests.get(parentId)!.push(quest);
							}
						}
					}
					await tx.done;
				}
			}
			catch (error: any) {
				console.debug(error)
			};
		}
		await tx.done;
		*/

		if (answerKeys.length === 0)
			return [];

		try {
			////////////////////////////////////////////////////////////
			// map
			// 0 = {'DALJINSKI' => IAnswerRow[2]}
			// 1 = {'EDGE2' => IAnswerRow[3]}
			// 2 = {'EDGE3' => IAnswerRow[4]}4

			////////////////////////////////////////////////////////////
			// 
			let GrpSections: IGrpSection[] = [];
			GrpSection.forEach((quests, id) => {
				//let variationsss: string[] = [];
				const GrpSection: IGrpSection = {
					id,
					groupTitle: '',
					groupParentTitle: 'kuro',
					parentGroupUp: '',
					answerRows: []
				};
				if (id !== null) {
					const Grp = this.allGroupRows.get(id);
					if (Grp) {
						const { title, titlesUpTheTree/*, variations*/ } = Grp!;
						GrpSection.groupTitle = title;
						GrpSection.parentGroupUp = titlesUpTheTree!;
						//variationsss = variations;
					}
					else {
						alert(`${id} Not found in allGrps`)
					}
				}
				else {
				}
				// const GrpSection: IGrpSection = {
				// 	id: id,
				// 	groupTitle: title,
				// 	groupParentTitle: 'kuro',
				// 	parentGroupUp: titlesUpTheTree!,
				// 	answerRows: []
				// };
				quests.forEach(quest => {
					// console.log(quest);
					/*
					if (variationsss.length > 0) {
						let wordsIncludesTag = false;
						// searchWords.forEach(w => {
						// 	variationsss.forEach(variation => {
						// 		if (variation === w.toUpperCase()) {
						// 			wordsIncludesTag = true;
						// 			GrpSection.quests.push({ ...quest, title: quest.title + ' ' + variation });
						// 		}
						// 	})
						// })
						if (!wordsIncludesTag) {
							// variationsss.forEach(variation => {
							// 	// console.log(quest);
							// 	GrpSection.answerRows.push({ ...quest, title: quest.title + ' ' + variation });
							// });
						}
					}
					else {
					*/
					GrpSection.answerRows.push(quest);
					/*}*/
				});
				GrpSections.push(GrpSection);
				//console.log(GrpSections)
			});
			return GrpSections;
		}
		catch (error: any) {
			console.log(error)
		};
		return [];
	}


	protected onSuggestionsClearRequested = () => {
		this.setState({
			suggestions: [],
			noSuggestions: false
		});
	};

	protected onSuggestionSelected(event: React.FormEvent<any>, data: Autosuggest.SuggestionSelectedEventData<IAnswerRow>): void {
		event.preventDefault(); // ?
		const answer: IAnswerRow = data.suggestion;
		const { topId, parentId, id } = answer;
		// alert(`Selected answer is ${answer.answerId} (${answer.text}).`);
		this.props.onSelectAnswer({ topId, parentId, id }, this.state.value);
	}

	/*
	protected renderSuggestion(suggestion: Answer, params: Autosuggest.RenderSuggestionParams): JSX.Element {
		 const className = params.isHighlighted ? "highlighted" : undefined;
		 return <span className={className}>{suggestion.name}</span>;
	}
	*/

	// TODO bac ovo u external css   style={{ textAlign: 'left'}}
	protected renderSuggestion(suggestion: IAnswerRow, params: Autosuggest.RenderSuggestionParams): JSX.Element {
		// const className = params.isHighlighted ? "highlighted" : undefined;
		//return <span className={className}>{suggestion.name}</span>;
		const matches = AutosuggestHighlightMatch(suggestion.title, params.query);
		const parts = AutosuggestHighlightParse(suggestion.title, matches);
		return (
			<span className="d-inline-block text-trunGrpe" style={{ textAlign: 'left' }}>
				{parts.map((part, index) => {
					const cls = part.highlight ? 'react-autosuggest__suggestion-match' : undefined;
					return (
						<span key={index} className={`${cls ?? ''}`}>
							{part.text}
						</span>
					);
				})}
			</span>
		);
	}

	protected renderSectionTitle(section: IGrpMy): JSX.Element {
		const { parentGroupUp } = section; // , groupParentTitle, groupTitle
		// let str = (groupParentTitle ? (groupParentTitle + " / ") : "") + groupTitle;
		// if (parentGroupUp)
		// 	str = " ... / " + str;
		return <span>{parentGroupUp}</span>
		// <strong>
		//{parentGroupUp}
		// </strong>;
	}

	// protected renderInputComponent(inputProps: Autosuggest.InputProps<IAnswerShort>): JSX.Element {
	// 	 const { onChange, onBlur, ...restInputProps } = inputProps;
	// 	 return (
	// 		  <div>
	// 				<input {...restInputProps} />
	// 		  </div>
	// 	 );
	// }

	protected renderInputComponent(inputProps: Autosuggest.RenderInputComponentProps): JSX.Element {
		const { ref, ...restInputProps } = inputProps;
		// if (ref !== undefined)
		// 	this.inputAutosuggest = ref as React.RefObject<HTMLInputElement>;

		return (
			<div>
				{/* <input {...restInputProps} ref={inputAutosuggest} /> */}
				<input ref={ref} autoFocus {...restInputProps} />
			</div>
		);
	}

	// const Input = forwardRef<HTMLInputElement, Omit<InputProps, "ref">>(
	// 	(props: Omit<InputProps, "ref">, ref): JSX.Element => (
	// 	  <input {...props} ref={ref} />
	// 	)
	//   );

	// protected renderSuggestionsContainer({ containerProps, children, query }:
	// 	Autosuggest.RenderSuggestionsContainerParams): JSX.Element {
	// 	return (
	// 		<div {...containerProps}>
	// 			<span>{children}</span>
	// 		</div>
	// 	);
	// }
	// endregion region Event handlers



	protected onChange(event: /*React.ChangeEvent<HTMLInputElement>*/ React.FormEvent<any>, { newValue }: Autosuggest.ChangeEvent): void {
		event.preventDefault(); // ?
		this.setState({ value: newValue });
	}

	// getParentTitle = async (id: string): Promise<any> => {
	// 	let group = await this.dbp.get('Groups', id);
	// 	return { parentGroupTitle: group.title, parentGroupUp: '' };
	// }

	protected async onSuggestionsFetchRequested({ value }: any): Promise<void> {
		return /*await*/ this.debouncedLoadSuggestions(value);
	}

	// private anyWord = (valueWordRegex: RegExp[], answerWords: string[]): boolean => {
	// 	for (let valWordRegex of valueWordRegex)
	// 		for (let answerWord of answerWords)
	// 			if (valWordRegex.test(answerWord))
	// 				return true;
	// 	return false;
	// }

	////////////////////////////////////
	// endregion region Helper methods

	protected getSuggestionValue(suggestion: IAnswerRow) {
		return suggestion.title;
	}

	protected getSectionSuggestions(section: IGrpMy) {
		return section.answerRows;
	}

	protected onSuggestionHighlighted(params: Autosuggest.SuggestionHighlightedParams): void {
		this.setState({
			highlighted: params.suggestion
		});
	}
	// endregion
}