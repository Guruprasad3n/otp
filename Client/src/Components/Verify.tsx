"use client";

import {
  Center,
  Heading,
  useToast,
  Button,
  FormControl,
  Flex,
  Stack,
  useColorModeValue,
  HStack,
  PinInput,
  PinInputField,
} from "@chakra-ui/react";
import axios from "axios";
import Cookies from "js-cookie";
import { useState } from "react";

export default function Verify() {
  const [isOtp, setIsOtp] = useState("");
  const toast = useToast();
  const handleVerify = async () => {
    try {
      const mobileNumber = Cookies.get("mobileNumber");
      console.log(mobileNumber);
      const response = await axios.post(
        "http://localhost:3000/api/otp/verify",
        {
          identifier: `${mobileNumber}`, // Replace with the actual identifier used during OTP generation
          userEnteredOTP: isOtp,
         
        }
        );
        console.log(identifier)

      if (response.data.success) {
        toast({
          title: "Verification Success",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Verification Failed",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("Error verifying OTP:", error);
    }
    // try {
    //   if (isOtp === "123456") {
    //     toast({
    //       title: `Verification Success`,
    //       status: `success`,
    //       duration: 3000,
    //       isClosable: true,
    //     });
    //   } else {
    //     toast({
    //       title: `Verification Failed`,
    //       status: `warning`,
    //       duration: 3000,
    //       isClosable: true,
    //     });
    //   }
    // } catch (error) {
    //   toast({
    //     title: `Verification Failed`,
    //     status: `error`,
    //     duration: 3000,
    //     isClosable: true,
    //   });
    // }
  };

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"} bg={"#242424"}>
      <Stack
        spacing={4}
        w={"full"}
        maxW={"sm"}
        bg={useColorModeValue("white", "gray.700")}
        rounded={"xl"}
        boxShadow={"lg"}
        p={6}
        my={10}
      >
        <Center>
          <Heading lineHeight={1.1} fontSize={{ base: "2xl", md: "3xl" }}>
            Verify your Mobile
          </Heading>
        </Center>
        <Center
          fontSize={{ base: "sm", sm: "md" }}
          color={useColorModeValue("gray.800", "gray.400")}
        >
          We have sent code to your Mobile
        </Center>
        <Center
          fontSize={{ base: "sm", sm: "md" }}
          fontWeight="bold"
          color={useColorModeValue("gray.800", "gray.400")}
        >
          username@mail.com
        </Center>
        <FormControl>
          <Center>
            <HStack>
              <PinInput
                placeholder=""
                value={isOtp}
                onChange={(value) => setIsOtp(value)}
              >
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
              </PinInput>
            </HStack>
          </Center>
        </FormControl>
        <Stack spacing={6}>
          <Button
            onClick={handleVerify}
            bg={"blue.400"}
            color={"white"}
            _hover={{
              bg: "blue.500",
            }}
          >
            Verify
          </Button>
        </Stack>
      </Stack>
    </Flex>
  );
}

// const identifier = 'your_identifier'; // replace with the actual identifier used during OTP generation
// const response = await axios.post('/api/verifyOtp', {
//   identifier,
//   userEnteredOTP:isOtp,
// });

// setVerificationStatus({
//   success: response.data.success,
//   message: response.data.message,
// });
// } catch (error) {
// console.error('Error verifying OTP:', error);
// setVerificationStatus({
//   success: false,
//   message: 'An error occurred during OTP verification.',
// });
