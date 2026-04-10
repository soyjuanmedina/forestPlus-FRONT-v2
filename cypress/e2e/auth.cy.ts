describe('Flujo de Registro y Autenticación de Usuario', () => {
    const timestamp = Date.now();
    const testEmail = `cy_user_${timestamp}@test.com`;
    const testPassword = 'Password123!';
    const testName = 'Cypress User';

    const TIMEOUT = 15000; // Un poco más de margen para el arranque

    beforeEach(() => {
        cy.viewport(1280, 720);
    });

    it('Debería completar el flujo completo desde registro hasta login exitoso', () => {
        // 1. Ir a la página de registro
        cy.visit('register', { timeout: TIMEOUT });
        
        // Esperamos a que el formulario esté listo
        cy.get('.auth-form', { timeout: TIMEOUT }).should('be.visible');

        // 2. Rellenar datos de registro
        cy.get('#name').type(testName, { delay: 30 });
        cy.get('#email').type(testEmail);
        cy.get('#password').type(testPassword);
        
        // Enviamos el formulario
        cy.get('button[type="submit"]').should('not.be.disabled').click();

        // 3. LA APP REDIRIGE A /verify-email
        // Esperamos a que la URL cambie
        cy.url({ timeout: TIMEOUT }).should('include', 'verify-email');
        
        // Verificamos que estamos en la pantalla de "revisa tu correo"
        // Buscamos algo que contenga "correo" o "verificar"
        cy.get('.verify-card', { timeout: TIMEOUT }).should('be.visible');

        // 4. Intentar login SIN haber verificado el email (para probar la restricción)
        cy.visit('login');
        cy.get('#email').type(testEmail);
        cy.get('#password').type(testPassword);
        cy.get('button[type="submit"]').click();

        // Error esperado del backend (EmailNotVerifiedException -> suele mapear a error 401/400 o mensaje)
        cy.get('.alert-error', { timeout: TIMEOUT }).should('be.visible');

        // 5. OBTENER EL UUID de verificación desde el backend (Nuestro endpoint de DEBUG)
        cy.request(`http://localhost:8080/api/loops/test-get-uuid?email=${testEmail}`)
            .then((response) => {
                expect(response.status).to.eq(200);
                const uuid = response.body.uuid;
                expect(uuid).to.exist;

                // 6. Simular el clic en el email (Ir a la URL de verificación)
                cy.visit(`verify-email?uuid=${uuid}`);

                // Debería salir el mensaje de confirmación exitosa
                // El componente VerifyEmail cambia su estado al recibir el UUID
                cy.contains(/verificado|correctamente|éxito/i, { timeout: TIMEOUT }).should('be.visible');

                // 7. Intentar el login final (ahora ya verificado)
                cy.visit('login');
                cy.get('#email').type(testEmail);
                cy.get('#password').type(testPassword);
                cy.get('button[type="submit"]').click();

                // 8. ¡ÉXITO! Deberíamos entrar al Dashboard
                cy.url({ timeout: TIMEOUT }).should('include', '/dashboard');
                cy.get('.dashboard-container', { timeout: TIMEOUT }).should('exist');
            });
    });
});
