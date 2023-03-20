import React from 'react'

import EmailOTPValidator from './EmailOTPValidator'

export default {
  title: 'Molecules/EmailOTPValidator',
  component: EmailOTPValidator,
}

const Template = (args) => (
  <div className="w-[402px] h-[491px]">
    <EmailOTPValidator {...args} />
  </div>
)

export const EmailOTPValidatorExample = Template.bind({})
EmailOTPValidatorExample.args = {
  email: 'john@email.com',
  goBack: async () => {},
  requestResend: async () => {},
  requestVerification: async () => {
    await new Promise((ok) => setTimeout(ok, 2500))

    return false
  },
}