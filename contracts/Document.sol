pragma solidity ^0.4.23;

contract Document{

    mapping(address => DocumentInfo) private UserDocuments;

    struct DocumentInfo{
        bytes16 username;
        bytes16 ipfsHash;
    }

    function storeDocumentToFS(bytes16 username, bytes16 ipfsHash) public returns(bool success){
        DocumentInfo memory docInfo = DocumentInfo({username:username, ipfsHash:ipfsHash});
        UserDocuments[msg.sender] = docInfo;
        return true;
    }

    function getDocumentFromFS() public view returns(bytes16 ipfsHash){
        return UserDocuments[msg.sender].ipfsHash;
    }
}
