export interface Message {
	text: string;
}

export class FacebookMessage {
	constructor($text){ console.log('loaded:'+$text); }
}