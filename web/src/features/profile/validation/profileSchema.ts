import * as yup from 'yup'

export const profileSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  roles: yup.array().of(yup.string().required()).min(1, 'Selecione um tipo de conta'),
  companyName: yup.string().when('$isCont', {
    is: true,
    then: (s) => s.trim().required('Nome da empresa é obrigatório').max(200, 'Nome muito longo'),
    otherwise: (s) => s.optional(),
  }),
  cnpj: yup.string().when('$isCont', {
    is: true,
    then: (s) =>
      s
        .required('CNPJ é obrigatório')
        .test(
          'cnpj-digits',
          'CNPJ deve ter 14 dígitos',
          (v) => (v?.replace(/\D/g, '').length ?? 0) === 14,
        ),
    otherwise: (s) => s.optional(),
  }),
  website: yup.string().when('$isCont', {
    is: true,
    then: (s) =>
      s.test(
        'url',
        'URL inválida (ex: https://site.com)',
        (v) => !v?.trim() || /^https?:\/\/.+\..+/.test(v.trim()),
      ),
    otherwise: (s) => s.optional(),
  }),
  instagram: yup.string().when('$isCont', {
    is: true,
    then: (s) =>
      s.test('no-spaces', 'Instagram inválido', (v) => !v?.trim() || !/\s/.test(v.trim())),
    otherwise: (s) => s.optional(),
  }),
  facebook: yup.string().when('$isCont', {
    is: true,
    then: (s) =>
      s.test('no-spaces', 'Facebook inválido', (v) => !v?.trim() || !/\s/.test(v.trim())),
    otherwise: (s) => s.optional(),
  }),
})

export const passwordSchema = yup.object({
  currentPassword: yup.string().required('Informe a senha atual'),
  newPassword: yup
    .string()
    .required('Informe a nova senha')
    .min(8, 'A nova senha precisa ter pelo menos 8 caracteres')
    .matches(/[a-z]/, 'Deve conter pelo menos uma letra minúscula')
    .matches(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
    .matches(/[0-9]/, 'Deve conter pelo menos um número')
    .matches(/[^a-zA-Z0-9]/, 'Deve conter pelo menos um caractere especial'),
  confirmPassword: yup
    .string()
    .required('Confirme a nova senha')
    .oneOf([yup.ref('newPassword')], 'As senhas não coincidem'),
})
