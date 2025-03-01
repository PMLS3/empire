<script setup lang="ts">
  import { toTypedSchema } from "@vee-validate/zod"
  import { Field, useForm } from "vee-validate"
  import { z } from "zod"
  import { useToaster } from "../../../shared/composables/toaster"

  import { AddonInputPassword } from "#components"

  definePageMeta({
    layout: "empty",
    title: "Signup",
    preview: {
      title: "Signup 1",
      description: "For authentication and sign up",
      categories: ["layouts", "authentication"],
      src: "/img/screens/auth-signup-1.png",
      srcDark: "/img/screens/auth-signup-1-dark.png",
      order: 157,
    },
  })

  const passwordRef = ref<InstanceType<typeof AddonInputPassword>>()

  const VALIDATION_TEXT = {
    EMAIL_REQUIRED: "A valid email is required",
    USERNAME_LENGTH: "Username must be at least 3 characters",
    PASSWORD_LENGTH: "Password must be at least 8 characters",
    PASSWORD_CONTAINS_EMAIL: "Password cannot contain your email",
    PASSWORD_MATCH: "Passwords do not match",
  }

  // This is the Zod schema for the form input
  // It's used to define the shape that the form data will have
  const zodSchema = z
    .object({
      username: z.string().min(3, VALIDATION_TEXT.USERNAME_LENGTH),
      email: z.string().email(VALIDATION_TEXT.EMAIL_REQUIRED),
      password: z.string().min(8, VALIDATION_TEXT.PASSWORD_LENGTH),
      confirmPassword: z.string(),
    })
    .superRefine((data, ctx) => {
      // This is a custom validation function that will be called
      // before the form is submitted
      if (
        passwordRef.value?.validation?.feedback?.warning ||
        passwordRef.value?.validation?.feedback?.suggestions?.length
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            passwordRef.value?.validation?.feedback?.warning ||
            passwordRef.value.validation.feedback?.suggestions?.[0],
          path: ["password"],
        })
      }
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: VALIDATION_TEXT.PASSWORD_MATCH,
          path: ["confirmPassword"],
        })
      }
    })

  // Zod has a great infer method that will
  // infer the shape of the schema into a TypeScript type
  type FormInput = z.infer<typeof zodSchema>

  const validationSchema = toTypedSchema(zodSchema)
  const initialValues = {
    username: "maya",
    email: "",
    password: "",
    confirmPassword: "",
  } satisfies FormInput

  const { values, handleSubmit, isSubmitting, setFieldError } = useForm({
    validationSchema,
    initialValues,
  })

  const router = useRouter()
  const toaster = useToaster()

  // This is where you would send the form data to the server
  const onSubmit = handleSubmit(async (values) => {
    try {
      console.log('📝 Submitting signup form:', values)
      const response = await $fetch('/api/auth/signup', {
        method: 'POST',
        body: {
          email: values.email,
          username: values.username,
          password: values.password,
          confirmPassword: values.confirmPassword
        }
      })
      console.log('📝 Signup successful:', response)

      toaster.clearAll()
      toaster.show({
        title: 'Success',
        message: `Account created for ${values.username}`,
        color: 'success',
        icon: 'ph:user-circle-fill',
        closable: true,
      })

      // Redirect to dashboard
      router.push('/auth/login')
    } catch (error: any) {
      console.error('❌ Signup error:', error)
      const message = error?.data?.message || error.message || 'Something went wrong'
      
      if (message.includes('username')) {
        setFieldError('username', message)
      } else if (message.includes('email')) {
        setFieldError('email', message)
      } else {
        toaster.show({
          title: 'Error',
          message,
          color: 'danger',
          icon: 'ph:x-circle-fill',
          closable: true,
        })
      }
    }
  })
</script>

<template>
  <div class="h-screen md:flex">
    <div
      class="from-primary-900 to-primary-500 i group relative hidden w-1/2 items-center justify-around overflow-hidden bg-gradient-to-tr md:flex"
    >
      <div class="mx-auto max-w-xs text-center">
        <BaseHeading as="h2" size="3xl" weight="medium" class="text-white">
          Have an Account?
        </BaseHeading>
        <BaseParagraph size="sm" class="text-muted-200 mb-3">
          No need to waste time on this page, let's take you back to your
          account
        </BaseParagraph>
        <BaseButton to="/auth/login" rounded="lg" class="w-full">
          Login to Account
        </BaseButton>
      </div>
      <div
        class="bg-muted-200/20 absolute -start-6 -top-6 h-14 w-0 origin-top-left rotate-45 rounded-full transition-all delay-[25ms] duration-300 group-hover:w-72"
      />
      <div
        class="bg-muted-200/20 absolute -top-12 start-20 h-14 w-0 origin-top-left rotate-45 rounded-full transition-all delay-75 duration-300 group-hover:w-48"
      />
      <div
        class="bg-muted-200/20 absolute -start-7 top-24 h-14 w-0 origin-top-left rotate-45 rounded-full transition-all delay-150 duration-300 group-hover:w-40"
      />

      <div
        class="bg-muted-200/20 absolute -bottom-6 -end-6 h-14 w-0 origin-bottom-right rotate-45 rounded-full transition-all delay-150 duration-300 group-hover:w-72"
      />
      <div
        class="bg-muted-200/20 absolute -bottom-12 end-20 h-14 w-0 origin-bottom-right rotate-45 rounded-full transition-all delay-75 duration-300 group-hover:w-48"
      />
      <div
        class="bg-muted-200/20 absolute -end-7 bottom-24 h-14 w-0 origin-bottom-right rotate-45 rounded-full transition-all delay-[25ms] duration-300 group-hover:w-40"
      />
    </div>
    <div
      class="dark:bg-muted-900 flex flex-col items-center justify-between bg-white py-10 md:w-1/2"
    >
      <div class="mx-auto flex w-full max-w-xs items-center justify-between">
        <NuxtLink
          to="/dashboards"
          class="text-muted-400 hover:text-primary-500 dark:text-muted-700 dark:hover:text-primary-500 transition-colors duration-300"
        >
          <Logo class="size-10" />
        </NuxtLink>
        <div>
          <BaseThemeToggle />
        </div>
      </div>
      <form
        method="POST"
        action=""
        class="mx-auto w-full max-w-xs"
        novalidate
        @submit.prevent="onSubmit"
      >
        <BaseHeading as="h2" size="3xl" weight="medium">
          Welcome to Tairo
        </BaseHeading>
        <BaseParagraph size="sm" class="text-muted-400 mb-6">
          Let's start by creating you account
        </BaseParagraph>

        <div class="mb-4 space-y-3">
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="username"
          >
            <FormInput
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="text"
              rounded="lg"
              placeholder="Username"
              icon="ph:fingerprint-duotone"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="email"
          >
            <FormInput
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="email"
              rounded="lg"
              placeholder="Email Address"
              icon="ph:at-duotone"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="password"
          >
            <AddonInputPassword
              ref="passwordRef"
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              :user-inputs="[values.username ?? '', values.email ?? '']"
              rounded="lg"
              placeholder="Password"
              icon="ph:lock-duotone"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
          <Field
            v-slot="{ field, errorMessage, handleChange, handleBlur }"
            name="confirmPassword"
          >
            <FormInput
              :model-value="field.value"
              :error="errorMessage"
              :disabled="isSubmitting"
              type="password"
              rounded="lg"
              placeholder="Confirm password"
              icon="ph:check"
              @update:model-value="handleChange"
              @blur="handleBlur"
            />
          </Field>
        </div>
        <BaseButton
          :disabled="isSubmitting"
          :loading="isSubmitting"
          type="submit"
          rounded="lg"
          color="primary"
          class="!h-11 w-full"
        >
          Create Account
        </BaseButton>
        <!--No account link-->
        <p
          class="text-muted-400 mt-4 flex justify-between font-sans text-sm leading-5"
        >
          <span>Have an account?</span>
          <NuxtLink
            to="/auth/login"
            class="text-primary-600 hover:text-primary-500 font-medium underline-offset-4 transition duration-150 ease-in-out hover:underline focus:underline focus:outline-none"
          >
            Login here
          </NuxtLink>
        </p>
      </form>
      <div class="text-center">
        <BaseText size="sm" class="text-muted-400">
          © {{ new Date().getFullYear() }} Tairo. All rights reserved.
        </BaseText>
      </div>
    </div>
  </div>
</template>
