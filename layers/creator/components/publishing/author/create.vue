<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useFieldError, useForm } from 'vee-validate'
import { z } from 'zod'
const props: any = withDefaults(
  defineProps<{
    selectedContact?: object
    isEditModal: boolean
    split: boolean
  }>(),
  {
    isEditModal: false,
    split: true,
    selectedContact: () => {
      return {
        first_name: '',
        last_name: '',
        email: '',
        comments: '',
        title: '',
        status: null,
        speciality: null,
        position: '',
        experience: null,
        rating: null,
        mobile: '',
        addresses: [],
        phones: [],
        address: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        location: '',
      }
    },
  },
)

const { companyPositions, salesCycles } = useCrm()
const authors = useState('authors', () => {
  return []
})
const { add, setDocu } = useFirebaseFirestore()
// This is the object that will contain the validation messages
const ONE_MB = 1000000
const VALIDATION_TEXT = {
  first_name_REQUIRED: 'First name can\'t be empty',
  last_name_REQUIRED: 'Last name can\'t be empty',
  EMAIL_REQUIRED: 'Email address can\'t be empty',
  OPTION_REQUIRED: 'Please select an option',
  ADDRESS_REQUIRED: 'Please enter an address',
  CITY_REQUIRED: 'Please enter a city',
  STATE_REQUIRED: 'Please enter a state',
  ZIPCODE_REQUIRED: 'Please enter a zipcode',
  STATUS_REQUIRED: 'Pick a status',
  AVATAR_TOO_BIG: `Avatar size must be less than 1MB`,
}

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z.object({
  avatar: z.custom<File>(v => v instanceof File).nullable(),
  contact: z.object({
    first_name: z.string().min(1, VALIDATION_TEXT.first_name_REQUIRED),
    last_name: z.string().min(1, VALIDATION_TEXT.last_name_REQUIRED),
    email: z.object({
      email: z.string(),
      type: z.string(),
    }),
    comments: z.string().optional(),
    role: z.string().optional(),
    location: z.string(),
    title: z.string(),
    bio: z.string(),
    mobile: z.string(),
    shortBio: z.string(),
    position: z.string(),
    status: z
      .union(salesCycles.value.map((cycle: any) => z.literal(cycle.name)))
      .nullable(),
    speciality: z
      .union([
        z.literal('Surgery'),
        z.literal('Cardiology'),
        z.literal('Pediatry'),
        z.literal('Dermataulogy'),
        z.literal('Traumatology'),
      ])
      .nullable(),
    experience: z
      .union([
        z.literal('0-5'),
        z.literal('5-10'),
        z.literal('10-15'),
        z.literal('15+'),
      ])
      .nullable(),
    rating: z
      .union([
        z.literal('1'),
        z.literal('2'),
        z.literal('3'),
        z.literal('4'),
        z.literal('5'),
      ])
      .nullable(),
    // set address as an array of adresses
    addresses: z.array(z.string()),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zipcode: z.string(),
    country: z.string(),
    phones: z.array(
      z.object({
        code: z.string(),
        dial_code: z.string(),
        emoji: z.string(),
        image: z.string(),
        name: z.string(),
        number: z.string(),
        phone: z.string(),
        unicode: z.string(),
        type: z.string(),
      }),
    ),
    emails: z.array(
      z.object({
        email: z.string(),
        type: z.string(),
      }),
    ),
  }),
  social: z.object({
    facebook: z.string(),
    twitter: z.string(),
    dribbble: z.string(),
    instagram: z.string(),
    github: z.string(),
    gitlab: z.string(),
  }),
})

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
  avatar: null,
  contact: {
    avatar: props.selectedContact?.avatar || null,
    first_name: props.selectedContact?.first_name || '',
    last_name: props.selectedContact?.last_name || '',
    email: props.selectedContact?.email || { email: '', type: 'work' },
    comments: props.selectedContact?.comments || '',
    title: props.selectedContact?.title || '',
    status: props.selectedContact?.status || null,
    speciality: props.selectedContact?.speciality || null,
    position: props.selectedContact?.position || '',
    experience: props.selectedContact?.experience || null,
    rating: props.selectedContact?.rating || null,
    address: props.selectedContact?.address || '',
    city: props.selectedContact?.city || '',
    state: props.selectedContact?.state || '',
    zipcode: props.selectedContact?.zipcode || '',
    country: props.selectedContact?.country || '',
    role: props.selectedContact?.role || '',
    location: props.selectedContact?.location || '',
    bio: props.selectedContact?.bio || '',
    shortBio: props.selectedContact?.shortBio || '',
    mobile: props.selectedContact?.mobile || '',
    addresses: props.selectedContact?.addresses || [],
    phones: props.selectedContact?.phones || [
      {
        code: '',
        dial_code: '',
        emoji: '',
        image: '',
        name: '',
        number: '',
        phone: '',
        unicode: '',
        type: 'wireless',
      },
    ],
    emails: props.selectedContact?.emails || [{ email: '', type: 'work' }],
  },
  social: {
    facebook: props.selectedContact?.facebook || '',
    twitter: props.selectedContact?.twitter || '',
    dribbble: props.selectedContact?.dribble || '',
    instagram: props.selectedContact?.instagram || '',
    github: props.selectedContact?.github || '',
    gitlab: props.selectedContact?.gitlab || '',
  },
}))

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

const success = ref(false)
const fieldsWithErrors = computed(() => Object.keys(errors.value).length)

// BaseInputFileHeadless gives us a listfile input, but we need to
// extract the file from the list and set it to the form
const inputFile = ref<FileList | null>()
const fileError = useFieldError('avatar')
watch(inputFile, (value) => {
  const file = value?.item(0) || null
  setFieldValue('avatar', file)
})

// Ask the user for confirmation before leaving the page if the form has unsaved changes
onBeforeRouteLeave(() => {
  if (meta.value.dirty) {
    return confirm('You have unsaved changes. Are you sure you want to leave?')
  }
})

const toaster = useToaster()
const mobile: any = ref('')
// This is where you would send the form data to the server
const onSubmit = handleSubmit(
  async (values: any) => {
    success.value = false
    // here you have access to the validated form values
    try {
      // fake delay, this will make isSubmitting value to be true
      values.contact.avatar = currentAvatar.value
      values.contact = {
        ...values.contact,
        ...addresses.value[0],
        addresses: addresses.value,
        phones: phones.value,
        mobile: phones.value[0],
        emails: emails.value,
        email: emails.value[0],
      }
      console.log('values', values.contact)
      let data: any = {}
      if (props.isEditModal) {
        let payload = { ...props.selectedContact, ...values.contact }
        data = await setDocu('authors', props.selectedContact.id, payload)
      }
      else {
        data = await add('authors', values.contact)
      }
      authors.value.push(data)

      toaster.clearAll()
      toaster.show({
        title: 'Success',
        message: `contact has been added!`,
        color: 'success',
        icon: 'ph:check',
        closable: true,
      })
    }
    catch (error: any) {
      console.log('error', error)
      // this will set the error on the form
      if (error.message === 'Fake backend validation error') {
        // @ts-expect-error - vee validate typing bug with nested keys
        setFieldError('contact.speciality', 'We have too many cardiologists')

        document.documentElement.scrollTo({
          top: 0,
          behavior: 'smooth',
        })

        toaster.clearAll()
        toaster.show({
          title: 'Oops!',
          message: 'Please review the errors in the form',
          color: 'danger',
          icon: 'lucide:alert-triangle',
          closable: true,
        })
      }
      return
    }

    resetForm()

    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

    success.value = true
    setTimeout(() => {
      success.value = false
    }, 3000)
  },
  (error: any) => {
    // this callback is optional and called only if the form has errors
    success.value = false
    console.log('ERROR', error)
    // here you have access to the error
    for (let i = 0; i < error.errors.length; i++) {
      let err = error.errors[i]
      setFieldError(err.field, err.message)
    }

    // you can use it to scroll to the first error
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  },
)

const currentRating: any = computed(() => {
  if (values.contact?.rating === undefined || values.contact?.rating === null)
    return 0
  return parseInt(values.contact?.rating)
})

const currentRatingText: any = computed(() => {
  switch (currentRating.value) {
    case 1:
      return 'Standard'
    case 2:
      return 'Good'
    case 3:
      return 'Advanced'
    case 4:
      return 'Expert'
    case 5:
      return 'Top 3%'
    default:
      return 'n/a'
  }
})
const currentAvatar: any = ref('/img/avatars/20.svg')

const isOpen: any = ref(false)

const selected = (img: any) => {
  currentAvatar.value = img[img.length - 1].src
}
const addr: any = ref({})
const addresses: any = ref([])

const changeAddress = (adr: any, index: any) => {
  console.log(adr, index)
  addr.value = adr
  addresses.value[index] = adr
}
const emails = ref([
  {
    email: '',
    type: 'work',
  },
])
onMounted(() => {
  if (props.selectedContact?.address) {
    addr.value.address = props.selectedContact?.address
  }
  if (props.selectedContact?.city) {
    addr.value.city = props.selectedContact?.city
  }
  if (props.selectedContact?.state) {
    addr.value.state = props.selectedContact?.state
  }
  if (props.selectedContact?.zipcode) {
    addr.value.zipcode = props.selectedContact?.zipcode
  }
  if (props.selectedContact?.country) {
    addr.value.country = props.selectedContact?.country
  }
  if (props.selectedContact?.location) {
    addr.value.location = props.selectedContact?.location
  }
  if (props.selectedContact?.mobile) {
    mobile.value = props.selectedContact?.mobile
  }

  if (
    props.selectedContact?.addresses == undefined
    || props.selectedContact?.addresses.length == 0
  ) {
    addresses.value = [
      {
        address: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        location: '',
        type: 'residential',
        hash: '',
      },
    ]
  }
  else {
    addresses.value = props.selectedContact?.addresses
  }

  if (
    props.selectedContact?.phones == undefined
    || props.selectedContact?.phones.length == 0
  ) {
    phones.value = [
      {
        code: '',
        dial_code: '',
        emoji: '',
        image: '',
        name: '',
        number: '',
        phone: '',
        unicode: '',
        type: 'wireless',
      },
    ]
  }
  else {
    phones.value = props.selectedContact?.phones
  }
  if (
    props.selectedContact?.emails == undefined
    || props.selectedContact?.emails.length == 0
  ) {
    emails.value = [
      {
        email: '',
        type: 'work',
      },
    ]
  }
  else {
    emails.value = props.selectedContact?.emails
  }
})
const phones: any = ref([])
const changeMobile = (mb: any, index: any) => {
  mobile.value = mb
  phones.value[index] = mb
}
</script>

<template>
  <form
    action=""
    method="POST"
    class="grid grid-cols-12 gap-6"
    @submit.prevent="onSubmit"
  >
    <div
      class="col-span-12 mb-4 flex flex-col justify-between md:flex-row md:items-center"
    >
      <div
        class="ltablet:max-w-full flex max-w-[425px] flex-col items-center gap-4 text-center md:flex-row md:text-left lg:max-w-full"
      >
        <Modal
          :open="isOpen"
          size="xl"
          footer-align="center"
          @close="isOpen = false"
        >
          <div class="h-screen overflow-auto p-4">
            <file-manager @input="selected" @close="isOpen = !isOpen" />
          </div>
        </Modal>
        <div>
          <BaseHeading
            as="h2"
            size="xl"
            weight="light"
            lead="tight"
            class="text-muted-800 dark:text-white"
          >
            <span>{{ !isEditModal ? "New author" : "Update author" }}</span>
          </BaseHeading>
          <BaseParagraph size="sm">
            <span class="text-muted-500">{{ isEditModal ? "Update" : "Create a new" }} author records
            </span>
          </BaseParagraph>
        </div>
      </div>
      <div
        class="mt-4 flex items-center justify-center gap-2 md:mt-0 md:justify-start"
      >
        <BaseButtonAction @click.prevent="$router.back()">
          <Icon name="lucide:arrow-left" class="size-3" />
          <span>Cancel</span>
        </BaseButtonAction>
      </div>
    </div>
    <div
      :class="{
        'ltablet:col-span-8 col-span-12 lg:col-span-8': split,
        'col-span-12': !split,
      }"
    >
      <BaseCard shape="rounded" class="p-4 md:p-8">
        <FormGroup
          label="Profile picture"
          sublabel="This is how others will recognize you"
        >
          <div class="flex w-full justify-between">
            <div class="relative flex flex-col items-center gap-4">
              <div class="relative size-24">
                <img
                  v-if="files?.length && files.item(0)"
                  :src="preview(files.item(0)!).value"
                  alt="Upload preview"
                  class="bg-muted-200 dark:bg-muted-700/60 size-24 rounded-full object-cover object-center"
                >
                <img
                  v-else
                  :src="currentAvatar"
                  alt="Upload preview"
                  class="bg-muted-200 dark:bg-muted-700/60 size-24 rounded-full object-cover object-center"
                >
                <div
                  v-if="files?.length && files.item(0)"
                  class="absolute bottom-0 end-0 z-20"
                >
                  <BaseButtonIcon
                    condensed
                    shape="full"
                    data-tooltip="Remove image"
                    @click="remove(files.item(0)!)"
                  >
                    <Icon name="lucide:x" class="size-4" />
                  </BaseButtonIcon>
                </div>
                <div v-else class="absolute bottom-0 end-0 z-20">
                  <div class="relative" data-tooltip="Upload image">
                    <BaseButtonIcon
                      condensed
                      shape="full"
                      @click="isOpen = !isOpen"
                    >
                      <Icon name="lucide:plus" class="size-4" />
                    </BaseButtonIcon>
                  </div>
                </div>
              </div>

              <div
                v-if="fileError"
                class="text-danger-600 inline-block font-sans text-[.8rem]"
              >
                {{ fileError }}
              </div>
            </div>

            <div class="text-right md:col-span-5">
              <div
                class="-mt-12 inline-flex w-full items-center justify-end gap-2 sm:w-auto"
              >
                <BaseButton class="!h-8 w-full sm:w-32">
                  Cancel
                </BaseButton>
                <BaseButton
                  type="submit"
                  color="primary"
                  class="!h-8 w-full sm:w-32"
                >
                  Submit
                </BaseButton>
              </div>
            </div>
          </div>
        </FormGroup>
        <div class="grid grid-cols-1 gap-4 gap-y-2 text-sm lg:grid-cols-12">
          <div class="ltablet:col-span-9 col-span-12 space-y-10 lg:col-span-9">
            <FormGroup label="General info" sublabel="Some general information">
              <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-6">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="contact.first_name"
                  >
                    <BaseInput
                      label="First name"
                      icon="ph:user-duotone"
                      placeholder="Ex: John"
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      type="text"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>

                <div class="col-span-12 md:col-span-6">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="contact.last_name"
                  >
                    <BaseInput
                      label="Last name"
                      icon="ph:user-duotone"
                      placeholder="Ex: Doe"
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      type="text"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>

                <div class="col-span-12 md:col-span-6">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="contact.title"
                  >
                    <BaseInput
                      label="Title"
                      icon="mdi:format-title"
                      placeholder="Ex: Dr."
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      type="text"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>

                <div class="col-span-12 md:col-span-6">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="contact.position"
                  >
                    <BaseSelect
                      label="Publishing Position"
                      icon="fluent:text-position-through-24-regular"
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    >
                      <option value="" hidden />
                      <option
                        v-for="(pos, index) in [
                          'Self Publisher',
                          'Author',
                          'Editor',
                          'Publisher',
                        ]"
                        :key="index"
                        :value="pos"
                      >
                        {{ pos }}
                      </option>
                    </BaseSelect>
                  </Field>
                </div>

                <div class="col-span-12">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="contact.comments"
                  >
                    <BaseTextarea
                      label="About the author"
                      placeholder="Ex: John Doe is a writer and a poet..."
                      rows="3"
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>

                <div class="col-span-12 md:col-span-4">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="contact.status"
                  >
                    <BaseSelect
                      label="Status"
                      icon="ph:heartbeat-duotone"
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    >
                      <option value="" hidden />
                      <option
                        v-for="(cycle, index) in salesCycles"
                        :key="index"
                        :value="cycle.name"
                      >
                        {{ cycle.name }}
                      </option>
                    </BaseSelect>
                  </Field>
                </div>

                <div class="col-span-12 md:col-span-4">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="contact.experience"
                  >
                    <BaseSelect
                      label="Experience"
                      icon="ph:trophy-duotone"
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    >
                      <option value="" hidden />
                      <option value="0-5">
                        0-5
                      </option>
                      <option value="5-10">
                        5-10
                      </option>
                      <option value="10-15">
                        10-15
                      </option>
                      <option value="15+">
                        15+
                      </option>
                    </BaseSelect>
                  </Field>
                </div>

                <div class="col-span-12 md:col-span-4">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="contact.rating"
                  >
                    <BaseSelect
                      label="Rating"
                      icon="ph:star-duotone"
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    >
                      <option value="" hidden />
                      <option value="1">
                        1
                      </option>
                      <option value="2">
                        2
                      </option>
                      <option value="3">
                        3
                      </option>
                      <option value="4">
                        4
                      </option>
                      <option value="5">
                        5
                      </option>
                    </BaseSelect>
                  </Field>
                </div>
              </div>
            </FormGroup>

            <FormGroup
              label="Contact info"
              sublabel="Some personal information"
            >
              <div class="relative">
                <Icon
                  name="material-symbols:add"
                  class="float-right size-5"
                  @click="
                    emails.push({
                      email: '',
                      type: 'work',
                    })
                  "
                />
              </div>
              <div
                v-for="(em, index) in emails"
                :key="index"
                class="grid grid-cols-12 gap-4"
              >
                <div v-if="index > 0" class="relative col-span-12">
                  <Icon
                    name="material-symbols:remove"
                    class="absolute right-0 size-5"
                    @click="emails.splice(index, 1)"
                  />
                </div>
                <div class="col-span-12 md:col-span-6">
                  <BaseInput
                    v-model="emails[index].email"
                    label="Email Address"
                    icon="ph:envelope-duotone"
                    placeholder="Ex: johndoe@gmail.com"
                    type="email"
                  />
                </div>

                <div class="col-span-12 md:col-span-6">
                  <BaseSelect
                    v-model="emails[index].type"
                    label="Type"
                    icon="gridicons:types"
                  >
                    <option value="" hidden />
                    <option value="work">
                      Work
                    </option>
                    <option value="personal">
                      Personal
                    </option>
                  </BaseSelect>
                </div>
              </div>

              <div class="relative mt-4">
                <Icon
                  name="material-symbols:add"
                  class="float-right size-5"
                  @click="
                    phones.push({
                      code: '',
                      dial_code: '',
                      emoji: '',
                      image: '',
                      name: '',
                      number: '',
                      phone: '',
                      unicode: '',
                      type: 'wireless',
                    })
                  "
                />
              </div>
              <div
                v-for="(mb, index) in phones"
                :key="index"
                class="relative grid grid-cols-12 gap-4"
              >
                <div v-if="index > 0" class="relative col-span-12">
                  <Icon
                    name="material-symbols:remove"
                    class="absolute right-0 size-5"
                    @click="phones.splice(index, 1)"
                  />
                </div>
                <div class="col-span-12 md:col-span-6">
                  <BaseMobile
                    :mobile="mb"
                    @mobile="changeMobile($event, index)"
                  />
                </div>
                <div class="col-span-12 md:col-span-6">
                  <BaseSelect
                    v-model="phones[index].type"
                    label="Type"
                    icon="gridicons:types"
                  >
                    <option value="" hidden />
                    <option value="wireless">
                      Wireless
                    </option>
                    <option value="phone">
                      Phone
                    </option>
                  </BaseSelect>
                </div>
              </div>
              <div class="relative mt-4">
                <Icon
                  name="material-symbols:add"
                  class="float-right size-5"
                  @click="
                    addresses.push({
                      address: '',
                      city: '',
                      state: '',
                      zipcode: '',
                      country: '',
                      location: '',
                    })
                  "
                />
              </div>
              <div
                v-for="(adr, index) in addresses"
                :key="index"
                class="mb-4"
              >
                <div v-if="index > 0" class="relative col-span-12">
                  <Icon
                    name="material-symbols:remove"
                    class="absolute right-0 size-5"
                    @click="addresses.splice(index, 1)"
                  />
                </div>
                <forms-address
                  :auto="selectedContact.location"
                  :addr="adr"
                  @change-address="changeAddress($event, index)"
                />
              </div>
            </FormGroup>

            <FormGroup
              label="Social Profiles"
              sublabel="This can help others finding you on social media"
            >
              <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 sm:col-span-6">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="social.facebook"
                  >
                    <BaseInput
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      type="text"
                      icon="fa6-brands:facebook-f"
                      placeholder="Facebook URL"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>
                <div class="col-span-12 sm:col-span-6">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="social.twitter"
                  >
                    <BaseInput
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      type="text"
                      icon="fa6-brands:twitter"
                      placeholder="Twitter URL"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>
                <div class="col-span-12 sm:col-span-6">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="social.dribbble"
                  >
                    <BaseInput
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      type="text"
                      icon="fa6-brands:dribbble"
                      placeholder="Dribbble URL"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>
                <div class="col-span-12 sm:col-span-6">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="social.instagram"
                  >
                    <BaseInput
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      type="text"
                      icon="fa6-brands:instagram"
                      placeholder="Instagram URL"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>
                <div class="col-span-12 sm:col-span-6">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="social.github"
                  >
                    <BaseInput
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      type="text"
                      icon="fa6-brands:github"
                      placeholder="Github URL"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>
                <div class="col-span-12 sm:col-span-6">
                  <Field
                    v-slot="{ field, errorMessage, handleChange, handleBlur }"
                    name="social.gitlab"
                  >
                    <BaseInput
                      :model-value="field.value"
                      :error="errorMessage"
                      :disabled="isSubmitting"
                      type="text"
                      icon="fa6-brands:gitlab"
                      placeholder="Gitlab URL"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    />
                  </Field>
                </div>
              </div>
            </FormGroup>
          </div>
        </div>
      </BaseCard>
    </div>
    <div
      :class="{
        'ltablet:col-span-4 col-span-12 lg:col-span-4': split,
        'col-span-12': !split,
      }"
    >
      <BaseCard class="ptablet:p-8 p-6 lg:p-8">
        <BaseText
          size="xs"
          weight="medium"
          class="text-muted-400 mb-6 block uppercase tracking-wider"
        >
          Record preview
        </BaseText>
        <div class="mb-4 flex">
          <div class="grow">
            <BaseHeading
              as="h3"
              weight="medium"
            >
              {{ values.contact?.title }}. {{ values.contact?.first_name }}
              {{ values.contact?.last_name }}
            </BaseHeading>
            <BaseText
              size="sm"
              class="text-muted-400"
            >
              {{
                values.contact?.city === "" ? "City" : values.contact?.city
              }},
              {{
                values.contact?.state === "" ? "State" : values.contact?.state
              }}
            </BaseText>
          </div>
          <div class="shrink-0">
            <BaseAvatar size="lg" :src="currentAvatar" />
          </div>
        </div>
        <div>
          <BaseHeading
            as="h3"
            size="md"
            weight="medium"
          >
            {{
              values.contact?.speciality === null
                ? "Main speciality"
                : values.contact?.speciality
            }}
          </BaseHeading>
          <BaseText size="sm" class="text-muted-400">
            {{
              values.contact?.comments === ""
                ? "Observations will be shown here"
                : values.contact?.comments
            }}
          </BaseText>
        </div>
        <div
          class="divide-muted-200 dark:divide-muted-700 flex w-full items-center divide-x py-6"
        >
          <div class="xxl:pe-6 flex flex-1 flex-col gap-1 pe-4">
            <BaseHeading
              as="h3"
              size="sm"
              weight="medium"
              lead="none"
            >
              {{
                values.contact?.status === null ? "n/a" : values.contact?.status
              }}
            </BaseHeading>
            <BaseText size="xs" class="text-muted-400">
              Role status
            </BaseText>
          </div>
          <div class="xxl:px-6 flex flex-1 flex-col gap-1 px-4">
            <BaseHeading
              as="h3"
              size="sm"
              weight="medium"
              lead="none"
            >
              {{
                values.contact?.experience === null
                  ? "n/a"
                  : values.contact?.experience
              }}
            </BaseHeading>
            <BaseText size="xs" class="text-muted-400">
              Years of exp.
            </BaseText>
          </div>
          <div class="xxl:ps-6 flex flex-1 flex-col gap-1 ps-4">
            <BaseHeading
              as="h3"
              size="sm"
              weight="medium"
              lead="none"
            >
              Lvl.
              {{
                values.contact?.rating === null ? "n/a" : values.contact?.rating
              }}
            </BaseHeading>
            <BaseText size="xs" class="text-muted-400">
              Global rating
            </BaseText>
          </div>
        </div>
        <div>
          <div class="flex items-end justify-between">
            <div class="w-24 text-xs uppercase leading-tight">
              Rating
            </div>
            <div class="text-success-600 font-sans text-xs font-semibold">
              {{ currentRatingText }}
            </div>
          </div>
          <div class="mt-1 flex">
            <div
              class="dark:border-muted-800 h-3 grow border-x border-white"
              :class="
                currentRating > 0
                  ? 'bg-success-600'
                  : 'bg-muted-200 dark:bg-muted-700'
              "
            />
            <div
              class="dark:border-muted-800 h-3 grow border-x border-white"
              :class="
                currentRating >= 2
                  ? 'bg-success-600'
                  : 'bg-muted-200 dark:bg-muted-700'
              "
            />
            <div
              class="dark:border-muted-800 h-3 grow border-x border-white"
              :class="
                currentRating >= 3
                  ? 'bg-success-600'
                  : 'bg-muted-200 dark:bg-muted-700'
              "
            />
            <div
              class="dark:border-muted-800 h-3 grow border-x border-white"
              :class="
                currentRating >= 4
                  ? 'bg-success-600'
                  : 'bg-muted-200 dark:bg-muted-700'
              "
            />
            <div
              class="dark:border-muted-800 h-3 grow border-x border-white"
              :class="
                currentRating === 5
                  ? 'bg-success-600'
                  : 'bg-muted-200 dark:bg-muted-700'
              "
            />
          </div>
        </div>
        <div
          v-for="(emi, index) in emails"
          :key="index"
          class="text-muted-400 mt-6 flex items-center gap-2"
        >
          <Icon name="lucide:mail" class="size-4" />
          <BaseText size="xs">
            {{
              emi?.email === "" ? "email address" : emi?.email
            }}
          </BaseText>
        </div>
        <div
          v-for="(ph, index) in phones"
          :key="index"
          class="text-muted-400 mt-6 flex items-center gap-2"
        >
          <Icon name="lucide:phone" class="size-4" />
          <BaseText size="xs">
            {{
              ph?.phone === "" ? "phone number" : ph?.phone
            }}
          </BaseText>
        </div>
      </BaseCard>
    </div>
    <FormSave
      :disabled="isSubmitting"
      :loading="isSubmitting"
      @reset="resetForm"
    />
  </form>
</template>
