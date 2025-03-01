<script setup lang="ts">
  import { toTypedSchema } from "@vee-validate/zod"
  import { Field, useForm } from "vee-validate"
  import { z } from "zod"
  import { useToaster } from "../../../shared/composables/toaster"

  definePageMeta({
    layout: "empty",
    title: "Login",
    preview: {
      title: "Login 1",
      description: "For authentication and sign in",
      categories: ["layouts", "authentication"],
      src: "/img/screens/auth-login-1.png",
      srcDark: "/img/screens/auth-login-1-dark.png",
      order: 151,
    },
  })

  const toaster = useToaster()
  const { login } = useAuth()

  const VALIDATION_TEXT = {
    EMAIL_REQUIRED: "A valid email is required",
    PASSWORD_REQUIRED: "A password is required",
  }

  // This is the Zod schema for the form input
  // It's used to define the shape that the form data will have
  const zodSchema = z.object({
    email: z.string().email(VALIDATION_TEXT.EMAIL_REQUIRED),
    password: z.string().min(1, VALIDATION_TEXT.PASSWORD_REQUIRED),
    trustDevice: z.boolean(),
  })

  // Zod has a great infer method that will
  // infer the shape of the schema into a TypeScript type
  type FormInput = z.infer<typeof zodSchema>

  const validationSchema = toTypedSchema(zodSchema)
  const initialValues = {
    email: "",
    password: "",
    trustDevice: false,
  } satisfies FormInput

  const {
    handleSubmit,
    isSubmitting,
    setFieldError,
    meta,
    values,
    errors,
    resetForm,
    setFieldValue,
    setErrors,
  } = useForm({
    validationSchema,
    initialValues,
  })

  const router = useRouter()

  // This is where you would send the form data to the server
  const onSubmit = handleSubmit(async (values) => {
    try {
      console.log('🔐 Attempting login with:', values.email)
      await login(values.email, values.password)
      
      // Show success message
      toaster.clearAll()
      toaster.show({
        title: 'Success',
        message: 'Successfully logged in',
        color: 'success',
        icon: 'ph:check-circle-fill',
        closable: true,
      })

      // Redirect to dashboard
      router.push('/dashboards')
    } catch (error: any) {
      console.error('🔐 Login error:', error)
      const message = error?.data?.message || error.message || 'Something went wrong'
      
      if (message.includes('password')) {
        setFieldError('password', message)
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
  <div class="dark:bg-muted-800 flex min-h-screen bg-white">
    <div
      class="relative flex flex-1 flex-col justify-center px-6 py-12 w-1/2 lg:flex-none"
    >
      <div class="dark:bg-muted-800 relative mx-auto w-full max-w-sm bg-white">
        <!--Nav-->
        <div class="flex w-full items-center justify-between">
          <NuxtLink
            to="/dashboards"
            class="text-muted-400 hover:text-primary-500 flex items-center gap-2 font-sans font-medium transition-colors duration-300"
          >
            <Icon name="gg:arrow-long-left" class="size-5" />
            <span>Back to Home</span>
          </NuxtLink>
          <!--Theme button-->
          <BaseThemeToggle />
        </div>
        <div>
          <BaseHeading
            as="h2"
            size="3xl"
            lead="relaxed"
            weight="medium"
            class="mt-6"
          >
            Welcome back.
          </BaseHeading>
          <BaseParagraph size="sm" class="text-muted-400 mb-6">
            Login with social media or your credentials
          </BaseParagraph>
          <!-- Social Sign Up Buttons -->
          <div class="flex flex-wrap justify-between gap-4">
            <!--Google button-->
            <button
              class="dark:bg-muted-700 text-muted-800 border-muted-300 dark:border-muted-600 nui-focus relative inline-flex grow items-center justify-center gap-2 rounded border bg-white px-6 py-4 dark:text-white"
            >
              <Icon name="logos:google-icon" class="size-5" />
              <div>Login with Google</div>
            </button>
            <!--Twitter button-->
            <button
              class="bg-muted-200 dark:bg-muted-700 hover:bg-muted-100 dark:hover:bg-muted-600 text-muted-600 dark:text-muted-400 nui-focus w-[calc(50%_-_0.5rem)] cursor-pointer rounded px-5 py-4 text-center transition-colors duration-300 md:w-auto"
            >
              <Icon name="fa6-brands:twitter" class="mx-auto size-4" />
            </button>
            <!--Linkedin button-->
            <button
              class="bg-muted-200 dark:bg-muted-700 hover:bg-muted-100 dark:hover:bg-muted-600 text-muted-600 dark:text-muted-400 nui-focus w-[calc(50%_-_0.5rem)] cursor-pointer rounded px-5 py-4 text-center transition-colors duration-300 md:w-auto"
            >
              <Icon name="fa6-brands:linkedin-in" class="mx-auto size-4" />
            </button>
          </div>
          <!-- 'or' divider -->
          <div class="flex-100 mt-8 flex items-center">
            <hr
              class="border-muted-200 dark:border-muted-700 flex-auto border-t-2"
            />
            <span
              class="text-muted-600 dark:text-muted-300 px-4 font-sans font-light"
            >
              OR
            </span>
            <hr
              class="border-muted-200 dark:border-muted-700 flex-auto border-t-2"
            />
          </div>
        </div>

        <!--Form section-->
        <form
          method="POST"
          action=""
          class="mt-6"
          novalidate
          @submit.prevent="onSubmit"
        >
          <div class="mt-5">
            <div>
              <div class="space-y-4">
                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="email"
                >
                  <FormInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="email"
                    label="Email address"
                    placeholder="Email address"
                    autocomplete="email"
                    :classes="{
                      input: 'h-12',
                    }"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>

                <Field
                  v-slot="{ field, errorMessage, handleChange, handleBlur }"
                  name="password"
                >
                  <FormInput
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    type="password"
                    label="Password"
                    placeholder="Password"
                    autocomplete="current-password"
                    :classes="{
                      input: 'h-12',
                    }"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>

              <div class="mt-6 flex items-center justify-between">
                <Field
                  v-slot="{ field, handleChange, handleBlur }"
                  name="trustDevice"
                >
                  <FormCheckbox
                    :model-value="field.value"
                    :disabled="isSubmitting"
                    rounded="sm"
                    label="Trust for 60 days"
                    color="primary"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>

                <div class="text-xs leading-5">
                  <NuxtLink
                    to="/auth/recover"
                    class="text-primary-600 hover:text-primary-500 font-sans font-medium underline-offset-4 transition duration-150 ease-in-out hover:underline"
                  >
                    Forgot your password?
                  </NuxtLink>
                </div>
              </div>

              <!--Submit-->
              <div class="mt-6">
                <div class="block w-full rounded-md shadow-sm">
                  <BaseButton
                    :disabled="isSubmitting"
                    :loading="isSubmitting"
                    type="submit"
                    color="primary"
                    class="!h-11 w-full"
                  >
                    Sign in
                  </BaseButton>
                </div>
              </div>
            </div>

            <!--No account link-->
            <p
              class="text-muted-400 mt-4 flex justify-between font-sans text-xs leading-5"
            >
              <span>Don't have an account?</span>
              <NuxtLink
                to="/auth/signup"
                class="text-primary-600 hover:text-primary-500 font-medium underline-offset-4 transition duration-150 ease-in-out hover:underline"
              >
                start your 14-day free trial
              </NuxtLink>
            </p>
          </div>
        </form>
      </div>
    </div>

    <div
      class="from-primary-900 to-primary-500 i group relative hidden w-1/2 items-center justify-around overflow-hidden bg-gradient-to-tr md:flex"
    >
      <div class="mx-auto max-w-xs text-center">
        <BaseHeading as="h2" size="3xl" weight="medium" class="text-white">
          Don't have an Account?
        </BaseHeading>
        <BaseParagraph size="sm" class="text-muted-200 mb-3">
          No need to waste time on this page, let's take you back to your
          account
        </BaseParagraph>
        <BaseButton to="/auth/signup" rounded="lg" class="w-full">
          Sign up to Account
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
  </div>
</template>
