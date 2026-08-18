import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { loginDetails } from '../test-data/loginCreds';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page, request }) => {
    if (fs.existsSync(authFile)) {
        const loginResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
            data: {
                "user": {
                    "email": loginDetails.USERNAME,
                    "password": loginDetails.PASSWORD
                }
            }
        });
        expect(loginResponse.status()).toEqual(200);
        const responseLoginJSON = await loginResponse.json();
        const token = responseLoginJSON.user.token;

        const storageStateFile = JSON.parse(fs.readFileSync(authFile, 'utf-8'))
        storageStateFile.origins[0].localStorage[0].value = token
        fs.writeFileSync(authFile, JSON.stringify(storageStateFile, null, 2))

    } else {
        await page.goto('https://conduit.bondaracademy.com/')
        await page.getByText('Sign in').click()
        await page.getByRole('textbox', { name: 'Email' }).fill('jb@example.com')
        await page.getByRole('textbox', { name: 'Password' }).fill('Jimmywimmy6')
        await page.getByRole('button', { name: 'Sign in' }).click()

        await expect(page.getByRole('link', { name: 'New Article' })).toBeVisible();

        await page.context().storageState({ path: authFile });
    }

});