import { AppController } from '../src/app.controller.js';
import { AppService } from '../src/app.service.js';

describe('AppController', () => {
	it('returns the API health payload', () => {
		const appController = new AppController(new AppService());

		expect(appController.getHello()).toEqual({
			status: 'ok',
			name: 'url-shortener-api',
			message: 'API initialized successfully',
		});
	});
});
