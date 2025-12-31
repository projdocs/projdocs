import { InputOTP, InputOTPGroup, InputOTPSlot, } from "@workspace/ui/components/input-otp";
import { H4, P } from "@workspace/ui/components/text";



export function OTPForm({}: {}) {
  return (
    <div className={"w-full flex flex-col gap-4"}>
      <div className={"flex flex-col items-center"}>
        <H4>{"Enter verification code"}</H4>
        <P className={"text-muted-foreground"}>{"We sent a 6-digit code to your email."}</P>
      </div>
      <InputOTP maxLength={6} id="otp" required>
        <InputOTPGroup
          className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
          <InputOTPSlot  index={0}/>
          <InputOTPSlot index={1}/>
          <InputOTPSlot index={2}/>
          <InputOTPSlot index={3}/>
          <InputOTPSlot index={4}/>
          <InputOTPSlot index={5}/>
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}
